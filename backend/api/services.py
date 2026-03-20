def calculate_price(square_feet, pounds, crew_number):
    hourly_price_per_person = 70
    price_per_square_foot = 0.5
    price_per_pound = 0.2

    total_price = ((hourly_price_per_person * crew_number) + (price_per_square_foot * square_feet) + (price_per_pound * pounds))
    return total_price