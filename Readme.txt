================================================================================
  TableSpot Melbourne – README
  COS10005 Web Development – Assignment 2, Semester 1, 2026
  Author : Shamsi Alibazi
  Due    : 31 May 2026
================================================================================


--------------------------------------------------------------------------------
1. WEBSITE STRUCTURE
--------------------------------------------------------------------------------

The website is a restaurant discovery and reservation platform called
"TableSpot Melbourne". It consists of the following files and folders:

assignment2/
├── index.html          – Home page
├── restaurants.html    – Restaurant listing page (6 restaurants)
├── recommend.html      – Restaurant recommendation page
├── register.html       – User registration page
├── reservation.html    – Table reservation page
├── bill.html           – Estimated bill calculator (bonus page)
├── css/
│   └── style.css       – Single external stylesheet for all pages
├── js/
│   └── script.js       – Single JavaScript file for all pages
├── images/
│   ├── logo.png        – Site logo
│   ├── Bella_Vita.jpeg
│   ├── Saffron Lane.jpg
│   ├── Vegansaladbowl.jpg
│   ├── Sakura_House.jpg
│   ├── River_Plate.jpg
│   └── ThaiOrchid.jpeg
└── Readme.txt          – This file

PAGE DESCRIPTIONS:

index.html
  The home page introduces the platform, its purpose (restaurant discovery
  and reservation), its values (convenience, variety, accessibility), and its
  target users (families, couples, professionals, tourists). It includes a
  featured restaurant preview, a services section, a hero call-to-action, and
  a sidebar with quick links and a "How It Works" guide.

restaurants.html
  Lists all six restaurants available on the platform. Each restaurant entry
  includes the restaurant name, cuisine type, location, price range per person,
  reservation deposit amount, dietary badges (vegan, halal, vegetarian,
  gluten-free), a table of signature dishes with prices, a short description
  (50–100 words), and a Reserve button linking to the reservation page.
  A search form at the top allows filtering by location and cuisine type
  using JavaScript.

recommend.html
  Provides a recommendation form where users select their dietary preference
  (radio buttons), budget range (dual range slider), and dining purpose
  (dropdown). On submission, JavaScript applies rule-based logic to match
  and rank suitable restaurants. Results display with a match label and a
  direct link to reserve the recommended restaurant.

register.html
  A user registration form with the following fields: username, email address,
  phone number, password, confirm password, gender (radio), dietary preferences
  (checkboxes), and country/region (dropdown). All fields are validated by
  JavaScript before submission is allowed.

reservation.html
  A table reservation form. The restaurant dropdown can be pre-filled when
  arriving from the recommendation page or home page (via URL query string or
  localStorage). The deposit amount updates dynamically when the restaurant
  changes. Payment fields show or hide based on the selected deposit method
  (voucher or online payment). A "same as email" checkbox auto-fills the
  billing email field.

bill.html (Bonus)
  An estimated bill calculator. Users select a restaurant and adjust sliders
  for number of guests, discount percentage, and tip percentage. Optional
  checkboxes add a drinks estimate and deduct the pre-paid deposit. The bill
  summary updates dynamically and includes a full breakdown: subtotal, drinks,
  discount, GST (10%), tip, deposit deduction, and total. A link directs the
  user to the reservation page for the selected restaurant.


--------------------------------------------------------------------------------
2. JAVASCRIPT VALIDATION LOGIC 
--------------------------------------------------------------------------------

All JavaScript is contained in js/script.js.

--- NAVIGATION ---

When any page loads, the script gets the current page filename from the browser
URL. It then loops through all navigation links and adds an "active" CSS class
to the link whose href matches the current filename. This makes the current page
appear highlighted in the navigation bar.

A mobile hamburger button toggles a CSS class called "nav-open" on the nav list,
which switches the list between hidden and visible on small screens.

--- REGISTRATION FORM VALIDATION (register.html) ---

Validation runs when the form is submitted. If any rule fails, the form is
blocked from submitting using event.preventDefault(). Clear error messages
appear below each invalid field. The rules are:

  Username:
    - Must not be empty.
    - Must be at least 5 characters long.
    - Must contain only letters (a–z, A–Z), numbers (0–9), or underscores (_).
    - Checked using the regular expression: /^[a-zA-Z0-9_]{5,}$/

  Email Address:
    - Must not be empty.
    - Must follow a valid email format (contains @ and a domain).
    - Checked using the regular expression: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  Phone Number:
    - Must not be empty.
    - Must contain only digits (no spaces, dashes, or brackets).
    - Must be between 8 and 15 digits long.

  Password:
    - Must not be empty.
    - Must be at least 10 characters long.
    - Must contain at least one uppercase letter (A–Z).
    - Must contain at least one lowercase letter (a–z).
    - Must contain at least one number (0–9).
    - Must contain at least one special character (e.g. @, #, $, !).

  Confirm Password:
    - Must not be empty.
    - Must exactly match the value entered in the Password field.

  Gender:
    - At least one radio button must be selected.

  Dietary Preferences:
    - At least one checkbox must be checked.

  Country / Region:
    - A value must be selected from the dropdown (not the placeholder option).

--- RESERVATION FORM VALIDATION (reservation.html) ---

Validation runs on form submission. Rules are:

  Full Name:
    - Must not be empty.

  Email Address:
    - Must not be empty and must be a valid email format.

  Phone Number:
    - Must not be empty.
    - Must contain at least 10 digits.

  Restaurant:
    - A restaurant must be selected from the dropdown.

  Reservation Date:
    - Must not be empty.
    - Must not be a date in the past. The script compares the selected date
      against today's date using JavaScript Date objects.

  Reservation Time:
    - Must not be empty.

  Number of Guests:
    - Must be a whole number greater than 0.

  Payment Method:
    - A payment method (voucher or online) must be selected.
    - If "Online Payment" is selected:
        * A card type must be selected.
        * The card number must contain digits only.
        * Visa and Mastercard numbers must be exactly 16 digits.
        * American Express numbers must be exactly 15 digits.
    - If "Voucher" is selected:
        * The card fields are hidden and not validated.
        * The voucher code field is shown (no validation required per spec).

  Billing Email:
    - Must not be empty and must be a valid email format.

--- DYNAMIC FEATURES (reservation.html) ---

  Deposit Display:
    When the user selects a restaurant from the dropdown, a change event
    listener fires and looks up the deposit amount in a JavaScript object
    called DEPOSIT_MAP. It then updates the text inside the deposit display
    box on the page.

  Conditional Payment Fields:
    Both the voucher field and the card fields have CSS class
    "conditional-field" which sets display:none by default. When a payment
    radio button is changed, the script adds or removes the "show" class,
    which sets display:block, making the correct field visible.

  Same Email Checkbox:
    When the checkbox is ticked, the billing email input is filled with the
    value from the contact email field and set to read-only. When unticked,
    the field is cleared and becomes editable again.

  Pre-fill from Recommendations:
    When the user clicks "Reserve This Restaurant" on the recommend page,
    the restaurant name is saved to localStorage. When reservation.html loads,
    the script reads from localStorage and sets the restaurant dropdown to
    that value, then removes the item from localStorage.

--- RECOMMENDATION ENGINE (recommend.html) ---

When the recommendation form is submitted, the script reads the three user
inputs: dietary preference, budget range (min and max from the sliders), and
dining purpose.

It then loops through a database of 6 restaurants stored as a JavaScript array
of objects. For each restaurant it applies the following rules:

  Rule 1 – Dietary filter (mandatory):
    If the user's dietary preference is not listed in the restaurant's dietary
    array, the restaurant is skipped entirely.

  Rule 2 – Budget overlap filter (mandatory):
    If the restaurant's price range does not overlap with the user's budget
    range at all, the restaurant is skipped.

  Rule 3 – Scoring:
    Restaurants that pass both filters receive a base score of 20 points.
    If the restaurant's purpose array includes the user's selected purpose,
    50 points are added (strong match). Additionally, up to 30 points are
    added based on how close the restaurant's average price is to the centre
    of the user's budget range.

Results are sorted from highest to lowest score. The top result is labelled
"Best Match" and others are labelled "Good Match".

--- RESTAURANT SEARCH FILTER (restaurants.html) ---

When the search form is submitted, the script reads the selected location and
cuisine values. It then loops through all restaurant card elements and checks
each card's data-location and data-cuisine attributes. Cards that do not match
are hidden using display:none. If no cards remain visible, a "no results"
message is shown.

--- BILL CALCULATOR (bill.html) ---

Every time any input changes (restaurant, sliders, checkboxes), the recalcBill()
function runs. It reads all current values and calculates:
  1. Food subtotal = average price per person × number of guests
  2. Drinks (optional) = $15 × number of guests
  3. Discount = subtotal × (discount% / 100), subtracted
  4. GST = after-discount amount × 10%
  5. Tip = (after-discount + GST) × (tip% / 100)
  6. Total = after-discount + GST + tip
  7. Remaining = total − deposit (if deposit checkbox is ticked)
The result is displayed in the summary panel on the right.


--------------------------------------------------------------------------------
3. KNOWN ISSUES AND LIMITATIONS
--------------------------------------------------------------------------------

- The registration and reservation forms submit to the Mercury test endpoint
  (http://mercury.swin.edu.au/it000000/cos10005/regtest.php). No real database
  or back-end processing is implemented, as per the assignment specification.

- Credit card validation checks digit count and format only. No real payment
  processing occurs. Test/fake card numbers should be used.

- The restaurant filter on restaurants.html filters only by location and cuisine.
  It does not filter by dietary preference or price range on this page
  (that functionality is on the recommendation page).

- The bill calculator uses the midpoint of each restaurant's price range as
  the estimated average. Actual costs will vary based on specific dish choices.

- Images are sourced from publicly accessible websites and are used for educational purposes only as part of a university assignment. (see References section below).
  If images fail to load on Mercury, check that filenames match exactly
  including capitalisation (the server is case-sensitive).


--------------------------------------------------------------------------------
4. REFERENCES
--------------------------------------------------------------------------------

The following third-party images were used in this project.
All images are used for educational purposes only as part of a university
assignment and are not for commercial use.

  images/Bella_Vita.jpeg
    Source: UberEats
    URL: https://www.ubereats.com/au/store/bella-vita-pizza-scoresby/fQHnHBtFX7CZExu_BxIWqQ
    Description: Italian pizza and pasta dish

  images/Saffron Lane.jpg
    Source: Klook Travel
    URL: https://www.klook.com/en-AU/activity/8058-saffron-buffet-restaurant-in-atlantis-the-palm-dubai/
    Description: Middle Eastern buffet food platter

  images/Vegansaladbowl.jpg
    Source: Bola (Facebook)
    URL: https://www.facebook.com/bola.lt/
    Description: Vegan salad bowl

  images/Sakura_House.jpg
    Source: TripAdvisor
    URL: https://www.tripadvisor.ie/Restaurant_Review-g660465-d4105185-Reviews-Sakura_House-Sete_Herault_Occitanie.html
    Description: Japanese restaurant food photo

  images/River_Plate.jpg
    Source: TripAdvisor
    URL: https://www.tripadvisor.com.au/Restaurant_Review-g312741-d27880153-Reviews-Banda_Experiencia_River-Buenos_Aires_Capital_Federal_District.html
    Description: Modern dining dish photo

  images/ThaiOrchid.jpeg
    Source: UberEats
    URL: https://www.ubereats.com/store/thai-orchid-restaurant-tyrone/SdiYSrCsSvyb7mSxjmc75w
    Description: Thai curry and rice dish

  images/logo.png
    Created by student (Shamsi Alibazi) using AI image generation (ChatGPT / DALL-E)
    URL: https://chatgpt.com
    Description: TableSpot Melbourne brand logo – AI-generated original work 

--------------------------------------------------------------------------------
5. GITHUB REPOSITORY
--------------------------------------------------------------------------------

Project repository (publicly accessible for marking):

  GitHub URL: https://github.com/ShamsiAlibazi/tablespot-cos10005-assignment2

  Repository contains all project files including HTML, CSS, JavaScript,
  images, and this Readme.txt file.


================================================================================
  END OF README
================================================================================
