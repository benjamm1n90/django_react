from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Estimator, Note
from .services import calculate_price


class CalculatePriceServiceTests(APITestCase):
    """Unit tests for the pure pricing calculation used by the estimator."""

    def test_calculate_price_known_values(self):
        # 70/hr/person * 2 crew + 0.5/sqft * 1000 sqft + 0.2/lb * 500 lb
        # = 140 + 500 + 100 = 740
        price = calculate_price(square_feet=1000, pounds=500, crew_number=2)
        self.assertEqual(price, 740)

    def test_calculate_price_zero_inputs(self):
        price = calculate_price(square_feet=0, pounds=0, crew_number=0)
        self.assertEqual(price, 0)

    def test_calculate_price_scales_with_crew_size(self):
        base = calculate_price(square_feet=100, pounds=100, crew_number=1)
        bigger_crew = calculate_price(square_feet=100, pounds=100, crew_number=2)
        self.assertEqual(bigger_crew - base, 70)


class UserRegistrationTests(APITestCase):
    def setUp(self):
        self.url = "/api/user/register/"

    def test_register_creates_user(self):
        response = self.client.post(
            self.url, {"username": "newuser", "password": "supersecret123"}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_does_not_return_password(self):
        response = self.client.post(
            self.url, {"username": "newuser2", "password": "supersecret123"}
        )
        self.assertNotIn("password", response.data)

    def test_register_missing_fields_fails(self):
        response = self.client.post(self.url, {"username": "onlyusername"})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class TokenAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="tokenuser", password="pass12345")

    def test_obtain_token_pair_with_valid_credentials(self):
        response = self.client.post(
            "/api/token/", {"username": "tokenuser", "password": "pass12345"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_obtain_token_pair_with_invalid_credentials(self):
        response = self.client.post(
            "/api/token/", {"username": "tokenuser", "password": "wrongpassword"}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        refresh = RefreshToken.for_user(self.user)
        response = self.client.post("/api/token/refresh/", {"refresh": str(refresh)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)


class NoteApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="noteuser", password="pass12345")
        self.other_user = User.objects.create_user(username="otheruser", password="pass12345")
        self.list_url = "/api/notes/"

    def test_unauthenticated_user_cannot_list_notes(self):
        # SessionAuthentication has no WWW-Authenticate header, so DRF's
        # exception handler returns 403 rather than 401 here.
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_authenticated_user_can_create_note(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post(
            self.list_url, {"title": "Move details", "content": "3 bedroom house"}
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        note = Note.objects.get(id=response.data["id"])
        self.assertEqual(note.author, self.user)

    def test_user_only_sees_own_notes(self):
        Note.objects.create(title="Mine", content="visible", author=self.user)
        Note.objects.create(title="Not mine", content="hidden", author=self.other_user)

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Mine")

    def test_user_can_delete_own_note(self):
        note = Note.objects.create(title="Delete me", content="bye", author=self.user)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f"/api/notes/delete/{note.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Note.objects.filter(id=note.id).exists())

    def test_user_cannot_delete_other_users_note(self):
        note = Note.objects.create(title="Not yours", content="nope", author=self.other_user)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f"/api/notes/delete/{note.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Note.objects.filter(id=note.id).exists())


class EstimateApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="estimateuser", password="pass12345")
        self.other_user = User.objects.create_user(username="otherestimator", password="pass12345")
        self.list_url = "/api/estimates/"

    def test_unauthenticated_user_cannot_list_estimates(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_estimate_calculates_price_server_side(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "customer_name": "Jane Doe",
            "square_footage": 1000,
            "pound_estimate": 500,
            "crew_size": 2,
        }
        response = self.client.post(self.list_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["price"], 740)
        self.assertEqual(response.data["user"], self.user.id)

    def test_create_estimate_ignores_client_supplied_price(self):
        # price is read-only on the serializer; even if a client sends one,
        # the server-calculated value should win.
        self.client.force_authenticate(user=self.user)
        payload = {
            "customer_name": "Sneaky",
            "square_footage": 100,
            "pound_estimate": 100,
            "crew_size": 1,
            "price": 999999,
        }
        response = self.client.post(self.list_url, payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response.data["price"], 999999)

    def test_user_only_sees_own_estimates(self):
        Estimator.objects.create(
            user=self.user, customer_name="Mine", square_footage=100,
            pound_estimate=100, crew_size=1, price=100,
        )
        Estimator.objects.create(
            user=self.other_user, customer_name="Not mine", square_footage=100,
            pound_estimate=100, crew_size=1, price=100,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["customer_name"], "Mine")

    def test_update_estimate_recalculates_price(self):
        estimate = Estimator.objects.create(
            user=self.user, customer_name="Jane Doe", square_footage=1000,
            pound_estimate=500, crew_size=2, price=740,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"/api/estimates/update/{estimate.id}/", {"crew_size": 4}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        estimate.refresh_from_db()
        # crew size doubled from 2 -> 4, price should reflect the new crew cost
        self.assertEqual(estimate.price, calculate_price(1000, 500, 4))

    def test_user_can_delete_own_estimate(self):
        estimate = Estimator.objects.create(
            user=self.user, customer_name="Delete me", square_footage=100,
            pound_estimate=100, crew_size=1, price=100,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f"/api/estimates/delete/{estimate.id}/")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Estimator.objects.filter(id=estimate.id).exists())

    def test_user_cannot_delete_other_users_estimate(self):
        estimate = Estimator.objects.create(
            user=self.other_user, customer_name="Not yours", square_footage=100,
            pound_estimate=100, crew_size=1, price=100,
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f"/api/estimates/delete/{estimate.id}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertTrue(Estimator.objects.filter(id=estimate.id).exists())
