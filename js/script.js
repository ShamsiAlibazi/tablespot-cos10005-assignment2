/**
 * TableSpot Melbourne - Main JavaScript File (script.js)
 * COS10005 Web Development - Assignment 2
 * Author: Shamsi Alibazi
 *
 * Contents:
 *   1.  Navigation  – mobile toggle, active page highlight
 *   2.  Recommendation Engine  – rule-based matching with slider budget
 *   3.  Restaurant Search / Filter (restaurants.html)
 *   4.  Registration Form Validation (register.html)
 *   5.  Reservation Form Validation & Dynamic Logic (reservation.html)
 *   6.  Bill Calculator (bill.html)
 */

document.addEventListener("DOMContentLoaded", function () {

    /* ================================================================
       1. NAVIGATION
       ================================================================ */

    /**
     * Highlights the current page's nav link by comparing the
     * link's href to the current filename.
     */
    (function highlightActiveNav() {
        const page = window.location.pathname.split("/").pop() || "index.html";
        document.querySelectorAll("nav a").forEach(function (link) {
            if (link.getAttribute("href") === page) {
                link.classList.add("active");
            }
        });
    })();

    /**
     * Mobile hamburger toggle – adds/removes 'nav-open' on the <ul>.
     */
    const navToggle = document.getElementById("navToggle");
    const navList   = document.querySelector("nav ul");

    if (navToggle && navList) {
        navToggle.addEventListener("click", function () {
            navList.classList.toggle("nav-open");
        });

        // Close menu when any nav link is clicked on mobile
        navList.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                navList.classList.remove("nav-open");
            });
        });
    }


    /* ================================================================
       2. RECOMMENDATION ENGINE (recommend.html)
       ================================================================ */

    /**
     * Restaurant database used by the recommendation engine.
     * Each entry includes:
     *   dietary  – array of supported dietary preferences
     *   minPrice – lower bound of price range per person
     *   maxPrice – upper bound of price range per person
     *   purpose  – array of suitable dining purposes
     *   score    – used internally during matching (added dynamically)
     */
    const RESTAURANT_DB = [
        {
            name:     "Bella Vita",
            cuisine:  "Italian",
            dietary:  ["none", "vegetarian"],
            minPrice: 35,
            maxPrice: 55,
            purpose:  ["family", "date", "casual"],
            deposit:  20,
            img:      "images/Bella_Vita.jpeg",
            imgAlt:   "Italian pasta and pizza at Bella Vita",
            desc:     "Handmade pasta, wood-fired pizza and classic Italian desserts in a warm Melbourne CBD setting."
        },
        {
            name:     "Saffron Lane",
            cuisine:  "Middle Eastern",
            dietary:  ["none", "halal", "vegetarian"],
            minPrice: 30,
            maxPrice: 50,
            purpose:  ["family", "casual", "date"],
            deposit:  15,
            img:      "images/Saffron Lane.jpg",
            imgAlt:   "Middle Eastern platters at Saffron Lane",
            desc:     "Grilled meats, fragrant rice, shared dips and mezze in a relaxed Richmond atmosphere."
        },
        {
            name:     "Green Bowl",
            cuisine:  "Vegan",
            dietary:  ["vegan", "vegetarian", "none"],
            minPrice: 25,
            maxPrice: 40,
            purpose:  ["family", "casual"],
            deposit:  10,
            img:      "images/Vegansaladbowl.jpg",
            imgAlt:   "Vegan salad bowl at Green Bowl Fitzroy",
            desc:     "Fresh plant-based meals, Buddha bowls and smoothies for health-conscious diners in Fitzroy."
        },
        {
            name:     "Sakura House",
            cuisine:  "Japanese",
            dietary:  ["none", "halal"],
            minPrice: 40,
            maxPrice: 65,
            purpose:  ["business", "casual", "date"],
            deposit:  25,
            img:      "images/Sakura_House.jpg",
            imgAlt:   "Sushi and ramen at Sakura House",
            desc:     "Sushi, ramen and bento in a calm CBD setting – perfect for business lunches or casual dinners."
        },
        {
            name:     "River Plate",
            cuisine:  "Modern Australian",
            dietary:  ["none"],
            minPrice: 45,
            maxPrice: 70,
            purpose:  ["business", "date", "casual"],
            deposit:  30,
            img:      "images/River_Plate.jpg",
            imgAlt:   "Grilled barramundi and steak at River Plate",
            desc:     "Modern Australian cuisine with riverside views at Southbank – ideal for celebrations and date nights."
        },
        {
            name:     "Thai Orchid",
            cuisine:  "Thai",
            dietary:  ["none", "vegetarian", "halal"],
            minPrice: 28,
            maxPrice: 45,
            purpose:  ["family", "casual"],
            deposit:  15,
            img:      "images/ThaiOrchid.jpeg",
            imgAlt:   "Thai curry and pad thai at Thai Orchid",
            desc:     "Bold curries, pad thai and shared plates for casual dining and family meals in Richmond."
        }
    ];

    /* --- Budget range sliders --- */
    const minPriceSlider = document.getElementById("minPrice");
    const maxPriceSlider = document.getElementById("maxPrice");
    const minPriceText   = document.getElementById("minPriceText");
    const maxPriceText   = document.getElementById("maxPriceText");

    /**
     * Keeps both sliders in sync and updates the colour fill bar.
     * Prevents min from exceeding max.
     */
    function updatePriceRange() {
        if (!minPriceSlider || !maxPriceSlider) return;

        let min = parseInt(minPriceSlider.value);
        let max = parseInt(maxPriceSlider.value);

        // Clamp: don't let min pass max
        if (min > max) { minPriceSlider.value = max; min = max; }

        if (minPriceText) minPriceText.textContent = "$" + min;
        if (maxPriceText) maxPriceText.textContent = "$" + max;

        // Update the highlighted range bar
        const rangeEl = document.querySelector(".selected-range");
        if (rangeEl) {
            const sliderMin = parseInt(minPriceSlider.min);   // 20
            const sliderMax = parseInt(minPriceSlider.max);   // 200
            const span = sliderMax - sliderMin;
            const leftPct  = ((min - sliderMin) / span) * 100;
            const rightPct = ((max - sliderMin) / span) * 100;
            rangeEl.style.left  = leftPct + "%";
            rangeEl.style.width = (rightPct - leftPct) + "%";
        }
    }

    if (minPriceSlider) minPriceSlider.addEventListener("input", updatePriceRange);
    if (maxPriceSlider) maxPriceSlider.addEventListener("input", updatePriceRange);
    updatePriceRange(); // Initialise on page load

    /* --- Recommendation form submission --- */
    const recommendForm = document.getElementById("recommendForm");

    if (recommendForm) {
        recommendForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const dietaryInput  = document.querySelector("input[name='dietary']:checked");
            const purposeSelect = document.getElementById("purpose");
            const output        = document.getElementById("recommendationOutput");

            // Basic form validation
            if (!dietaryInput || !purposeSelect || purposeSelect.value === "") {
                output.innerHTML = "<p class='error-msg show'>Please complete all fields before submitting.</p>";
                return;
            }

            const selectedDietary = dietaryInput.value;
            const selectedPurpose = purposeSelect.value;
            const minBudget = minPriceSlider ? parseInt(minPriceSlider.value) : 0;
            const maxBudget = maxPriceSlider ? parseInt(maxPriceSlider.value) : 999;

            /**
             * Rule-based matching:
             *  Rule 1 (mandatory) – dietary must match the restaurant's dietary array
             *  Rule 2 (mandatory) – restaurant's price range must overlap user's budget
             *  Rule 3 (scoring)   – purpose match adds 50 pts; overlap with budget mid adds up to 30 pts
             * Results are sorted by score descending so best matches appear first.
             */
            const scored = [];

            RESTAURANT_DB.forEach(function (r) {
                // Rule 1: dietary filter (mandatory)
                if (!r.dietary.includes(selectedDietary)) return;

                // Rule 2: budget overlap (mandatory)
                // Overlap exists when restaurant's range does NOT sit entirely outside user's range
                if (r.maxPrice < minBudget || r.minPrice > maxBudget) return;

                let score = 20; // base points for passing mandatory rules

                // Rule 3a: purpose match (adds significant score)
                if (r.purpose.includes(selectedPurpose)) {
                    score += 50;
                }

                // Rule 3b: how centred is the restaurant in the user's budget? (adds up to 30 pts)
                const userMid = (minBudget + maxBudget) / 2;
                const restMid = (r.minPrice + r.maxPrice) / 2;
                const budgetRange = Math.max(maxBudget - minBudget, 1);
                const proximity = 1 - Math.min(Math.abs(userMid - restMid) / budgetRange, 1);
                score += Math.round(proximity * 30);

                scored.push({ restaurant: r, score: score });
            });

            // Sort by score, highest first
            scored.sort(function (a, b) { return b.score - a.score; });

            // Render results
            if (scored.length === 0) {
                output.innerHTML = "<p>No restaurants match your current preferences. Try adjusting your budget or dietary preference.</p>";
            } else {
                let html = "";
                scored.forEach(function (item, index) {
                    const r = item.restaurant;
                    const matchLabel = index === 0 ? "⭐ Best Match" : "✓ Good Match";
                    html += `
                        <article class="recommend-card">
                            <h4>${r.name} <small style="font-weight:normal;color:#AF8260;">${r.cuisine}</small></h4>
                            <p><strong>${matchLabel}</strong></p>
                            <p>${r.desc}</p>
                            <p><strong>Price range:</strong> $${r.minPrice}–$${r.maxPrice} per person &nbsp;|&nbsp; <strong>Deposit:</strong> $${r.deposit}</p>
                            <button type="button" class="button"
                                onclick="selectRecommendedRestaurant('${r.name}')">
                                Reserve This Restaurant
                            </button>
                            <a href="restaurants.html#${r.name.replace(/\s+/g, '')}" class="button-outline">
                                View Details
                            </a>
                        </article>
                    `;
                });
                output.innerHTML = html;
            }

            // Scroll results into view
            output.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }


    /* ================================================================
       3. RESTAURANT SEARCH / FILTER (restaurants.html)
       ================================================================ */

    const searchForm = document.getElementById("restaurantSearchForm");

    if (searchForm) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const locationVal = document.getElementById("locationFilter").value;
            const cuisineVal  = document.getElementById("cuisineFilter").value;
            const cards       = document.querySelectorAll("#restaurantGrid .restaurant-card");
            const noResults   = document.getElementById("noResults");
            let   visible     = 0;

            cards.forEach(function (card) {
                const locMatch = (locationVal === "all") || (card.dataset.location === locationVal);
                const cuiMatch = (cuisineVal  === "all") || (card.dataset.cuisine  === cuisineVal);

                if (locMatch && cuiMatch) {
                    card.style.display = "";
                    visible++;
                } else {
                    card.style.display = "none";
                }
            });

            if (noResults) {
                noResults.style.display = (visible === 0) ? "block" : "none";
            }
        });
    }


    /* ================================================================
       4. REGISTRATION FORM VALIDATION (register.html)
       ================================================================ */

    /**
     * Helper functions: show / clear a field's error message.
     */
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const err   = document.getElementById(fieldId + "Error");
        if (field) field.classList.add("input-error");
        if (err)   { err.textContent = message; err.classList.add("show"); }
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const err   = document.getElementById(fieldId + "Error");
        if (field) { field.classList.remove("input-error"); field.classList.add("input-valid"); }
        if (err)   err.classList.remove("show");
    }

    /* Validation rule functions — each returns true if valid */

    /** Username: min 5 chars, letters/numbers/underscore only */
    function validateUsername() {
        const val = (document.getElementById("username") || {}).value || "";
        const trimmed = val.trim();
        if (!trimmed) {
            showError("username", "Username is required.");
            return false;
        }
        if (!/^[a-zA-Z0-9_]{5,}$/.test(trimmed)) {
            showError("username", "At least 5 characters; only letters, numbers, and underscores.");
            return false;
        }
        clearError("username");
        return true;
    }

    /** Email: standard format check */
    function validateEmailField(fieldId) {
        const val = (document.getElementById(fieldId) || {}).value || "";
        if (!val.trim()) {
            showError(fieldId, "Email address is required.");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
            showError(fieldId, "Please enter a valid email address (e.g. name@example.com).");
            return false;
        }
        clearError(fieldId);
        return true;
    }

    /** Phone: digits only, 8–15 digits */
    function validatePhoneField(fieldId) {
        const val = (document.getElementById(fieldId) || {}).value || "";
        const digits = val.replace(/\D/g, "");
        if (!val.trim()) {
            showError(fieldId, "Phone number is required.");
            return false;
        }
        if (digits.length < 8 || digits.length > 15) {
            showError(fieldId, "Phone number must contain 8–15 digits (numbers only).");
            return false;
        }
        clearError(fieldId);
        return true;
    }

    /** Password: min 10 chars, upper, lower, number, special */
    function validatePassword() {
        const val = (document.getElementById("password") || {}).value || "";
        if (!val) { showError("password", "Password is required."); return false; }
        if (val.length < 10) {
            showError("password", "Password must be at least 10 characters long.");
            return false;
        }
        if (!/[A-Z]/.test(val)) {
            showError("password", "Password must include at least one uppercase letter.");
            return false;
        }
        if (!/[a-z]/.test(val)) {
            showError("password", "Password must include at least one lowercase letter.");
            return false;
        }
        if (!/[0-9]/.test(val)) {
            showError("password", "Password must include at least one number.");
            return false;
        }
        if (!/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|`~]/.test(val)) {
            showError("password", "Password must include at least one special character (e.g. @, #, $).");
            return false;
        }
        clearError("password");
        return true;
    }

    /** Confirm password: must equal password */
    function validateConfirmPassword() {
        const pw  = (document.getElementById("password")        || {}).value || "";
        const cpw = (document.getElementById("confirmPassword") || {}).value || "";
        if (!cpw) { showError("confirmPassword", "Please confirm your password."); return false; }
        if (pw !== cpw) { showError("confirmPassword", "Passwords do not match."); return false; }
        clearError("confirmPassword");
        return true;
    }

    /** Gender: one radio must be selected */
    function validateGender() {
        const checked = document.querySelector("input[name='gender']:checked");
        const err = document.getElementById("genderError");
        if (!checked) {
            if (err) { err.textContent = "Please select a gender."; err.classList.add("show"); }
            return false;
        }
        if (err) err.classList.remove("show");
        return true;
    }

    /** Dietary preference: at least one checkbox checked */
    function validateDietaryCheck() {
        const checked = document.querySelectorAll("input[name='dietaryPref']:checked");
        const err = document.getElementById("dietaryPrefError");
        if (checked.length === 0) {
            if (err) { err.textContent = "Please select at least one dietary preference."; err.classList.add("show"); }
            return false;
        }
        if (err) err.classList.remove("show");
        return true;
    }

    /** Country: must select a value */
    function validateCountry() {
        const val = (document.getElementById("country") || {}).value || "";
        if (!val) { showError("country", "Please select your country or region."); return false; }
        clearError("country");
        return true;
    }

    /* Wire up live validation (on blur) for registration form */
    function wireRegisterBlur(fieldId, fn) {
        const el = document.getElementById(fieldId);
        if (el) el.addEventListener("blur", fn);
    }

    wireRegisterBlur("username",        validateUsername);
    wireRegisterBlur("regEmail",        function () { validateEmailField("regEmail"); });
    wireRegisterBlur("regPhone",        function () { validatePhoneField("regPhone"); });
    wireRegisterBlur("password",        validatePassword);
    wireRegisterBlur("confirmPassword", validateConfirmPassword);
    wireRegisterBlur("country",         validateCountry);

    /* Registration form submit */
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (e) {
            // Run all validators; if any returns false, block submission
            const allValid = [
                validateUsername(),
                validateEmailField("regEmail"),
                validatePhoneField("regPhone"),
                validatePassword(),
                validateConfirmPassword(),
                validateGender(),
                validateDietaryCheck(),
                validateCountry()
            ].every(Boolean);

            if (!allValid) {
                e.preventDefault();
                // Scroll to first visible error
                const firstErr = registerForm.querySelector(".error-msg.show");
                if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }


    /* ================================================================
       5. RESERVATION FORM VALIDATION & DYNAMIC LOGIC (reservation.html)
       ================================================================ */

    /**
     * Per-restaurant deposit amounts.
     * Keys must match the <option value="..."> in the restaurant dropdown.
     */
    const DEPOSIT_MAP = {
        "Bella Vita":    20,
        "Saffron Lane":  15,
        "Green Bowl":    10,
        "Sakura House":  25,
        "River Plate":   30,
        "Thai Orchid":   15
    };

    /* Set today as min date for date input */
    const resDateInput = document.getElementById("resDate");
    if (resDateInput) {
        resDateInput.min = new Date().toISOString().split("T")[0];
    }

    /* Pre-fill restaurant from URL query string or localStorage */
    const restaurantSelect = document.getElementById("restaurant");

    if (restaurantSelect) {
        // Check URL param first (?restaurant=...)
        const urlParam = new URLSearchParams(window.location.search).get("restaurant");
        if (urlParam) {
            restaurantSelect.value = urlParam;
        }
        // Fall back to localStorage (set by recommend page)
        const stored = localStorage.getItem("selectedRestaurant");
        if (stored && !urlParam) {
            restaurantSelect.value = stored;
            localStorage.removeItem("selectedRestaurant"); // use once
        }

        // Trigger deposit update on page load
        updateDepositDisplay();
    }

    /** Updates the deposit display box when the restaurant changes */
    function updateDepositDisplay() {
        const depositBox = document.getElementById("depositDisplay");
        if (!depositBox || !restaurantSelect) return;
        const key = restaurantSelect.value;
        if (key && DEPOSIT_MAP[key] !== undefined) {
            depositBox.textContent = "$" + DEPOSIT_MAP[key] + " AUD";
        } else {
            depositBox.textContent = "Select a restaurant to see the deposit.";
        }
    }

    if (restaurantSelect) {
        restaurantSelect.addEventListener("change", updateDepositDisplay);
    }

    /** Show/hide voucher or card fields based on payment method */
    const paymentRadios = document.querySelectorAll("input[name='paymentMethod']");
    const voucherField  = document.getElementById("voucherField");
    const cardField     = document.getElementById("cardField");
    const cardTypeField = document.getElementById("cardTypeField");

    function togglePaymentFields() {
        const selected = document.querySelector("input[name='paymentMethod']:checked");
        if (!selected) return;

        if (selected.value === "voucher") {
            if (voucherField)  voucherField.classList.add("show");
            if (cardField)     cardField.classList.remove("show");
            if (cardTypeField) cardTypeField.classList.remove("show");
        } else if (selected.value === "online") {
            if (voucherField)  voucherField.classList.remove("show");
            if (cardField)     cardField.classList.add("show");
            if (cardTypeField) cardTypeField.classList.add("show");
        }
    }

    paymentRadios.forEach(function (r) {
        r.addEventListener("change", togglePaymentFields);
    });

    /** "Same as email" checkbox auto-fills billing email */
    const sameEmailCheck = document.getElementById("sameEmail");
    const billingEmail   = document.getElementById("billingEmail");
    const mainEmail      = document.getElementById("resEmail");

    if (sameEmailCheck && billingEmail && mainEmail) {
        sameEmailCheck.addEventListener("change", function () {
            billingEmail.value    = this.checked ? mainEmail.value : "";
            billingEmail.readOnly = this.checked;
        });
        mainEmail.addEventListener("input", function () {
            if (sameEmailCheck.checked) billingEmail.value = mainEmail.value;
        });
    }

    /* --- Reservation validation functions --- */

    function validateResFullName() {
        const val = (document.getElementById("fullName") || {}).value || "";
        if (!val.trim()) { showError("fullName", "Full name is required."); return false; }
        clearError("fullName");
        return true;
    }

    function validateResRestaurant() {
        const val = restaurantSelect ? restaurantSelect.value : "";
        if (!val) { showError("restaurant", "Please select a restaurant."); return false; }
        clearError("restaurant");
        return true;
    }

    function validateResDate() {
        const val = (document.getElementById("resDate") || {}).value || "";
        if (!val) { showError("resDate", "Reservation date is required."); return false; }
        const chosen = new Date(val);
        const today  = new Date(); today.setHours(0, 0, 0, 0);
        if (chosen < today) { showError("resDate", "Date cannot be in the past."); return false; }
        clearError("resDate");
        return true;
    }

    function validateResTime() {
        const val = (document.getElementById("resTime") || {}).value || "";
        if (!val) { showError("resTime", "Reservation time is required."); return false; }
        clearError("resTime");
        return true;
    }

    function validateNumPeople() {
        const val = parseInt((document.getElementById("numPeople") || {}).value || "0");
        if (!val || val < 1) { showError("numPeople", "Number of guests must be at least 1."); return false; }
        clearError("numPeople");
        return true;
    }

    /**
     * Validates the payment section:
     *   - A method must be selected
     *   - If online: card type selected + card number correct length
     *   - Voucher field: no validation required (per spec)
     */
    function validatePayment() {
        const selected = document.querySelector("input[name='paymentMethod']:checked");
        const payErr   = document.getElementById("paymentError");

        if (!selected) {
            if (payErr) { payErr.textContent = "Please select a deposit payment method."; payErr.classList.add("show"); }
            return false;
        }
        if (payErr) payErr.classList.remove("show");

        if (selected.value === "online") {
            // Validate card type
            const cardType = (document.getElementById("cardType") || {}).value || "";
            if (!cardType) { showError("cardType", "Please select a card type."); return false; }
            clearError("cardType");

            // Validate card number digits and length
            const rawNum = (document.getElementById("cardNumber") || {}).value || "";
            const digits = rawNum.replace(/\D/g, "");
            if (!digits) { showError("cardNumber", "Credit card number is required."); return false; }
            if (!/^\d+$/.test(digits)) { showError("cardNumber", "Card number must contain digits only."); return false; }

            if ((cardType === "visa" || cardType === "mastercard") && digits.length !== 16) {
                showError("cardNumber", "Visa and Mastercard must be 16 digits."); return false;
            }
            if (cardType === "amex" && digits.length !== 15) {
                showError("cardNumber", "American Express must be 15 digits."); return false;
            }
            clearError("cardNumber");
        }
        return true;
    }

    function validateBillingEmail() {
        return validateEmailField("billingEmail");
    }

    /* Wire blur events on reservation fields */
    function wireResBlur(fieldId, fn) {
        const el = document.getElementById(fieldId);
        if (el) el.addEventListener("blur", fn);
    }

    wireResBlur("fullName",  validateResFullName);
    wireResBlur("resEmail",  function () { validateEmailField("resEmail"); });
    wireResBlur("resPhone",  function () { validatePhoneField("resPhone"); });
    wireResBlur("resDate",   validateResDate);
    wireResBlur("resTime",   validateResTime);
    wireResBlur("numPeople", validateNumPeople);
    wireResBlur("billingEmail", validateBillingEmail);
    if (restaurantSelect) restaurantSelect.addEventListener("change", validateResRestaurant);

    /* Reservation form submit */
    const reservationForm = document.getElementById("reservationForm");

    if (reservationForm) {
        reservationForm.addEventListener("submit", function (e) {
            const allValid = [
                validateResFullName(),
                validateEmailField("resEmail"),
                validatePhoneField("resPhone"),
                validateResRestaurant(),
                validateResDate(),
                validateResTime(),
                validateNumPeople(),
                validatePayment(),
                validateBillingEmail()
            ].every(Boolean);

            if (!allValid) {
                e.preventDefault();
                const firstErr = reservationForm.querySelector(".error-msg.show");
                if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }


    /* ================================================================
       6. BILL CALCULATOR (bill.html)
       ================================================================ */

    /**
     * Price range lookup for the bill calculator.
     * Matches the restaurant names used in the restaurants page.
     */
    const PRICE_RANGES = {
        "Bella Vita":   { low: 35, high: 55, deposit: 20 },
        "Saffron Lane": { low: 30, high: 50, deposit: 15 },
        "Green Bowl":   { low: 25, high: 40, deposit: 10 },
        "Sakura House": { low: 40, high: 65, deposit: 25 },
        "River Plate":  { low: 45, high: 70, deposit: 30 },
        "Thai Orchid":  { low: 28, high: 45, deposit: 15 }
    };

    const billRestaurantSelect = document.getElementById("billRestaurant");
    const billPeopleSlider     = document.getElementById("billPeople");
    const billDiscountSlider   = document.getElementById("billDiscount");
    const billTipSlider        = document.getElementById("billTip");
    const billIncludeDeposit   = document.getElementById("includeDeposit");
    const billIncludeDrinks    = document.getElementById("includeDrinks");
    const billSummaryEl        = document.getElementById("billSummary");

    /** Updates all slider display labels and triggers bill recalculation */
    function syncSliderDisplay(sliderId, displayId, suffix) {
        const slider  = document.getElementById(sliderId);
        const display = document.getElementById(displayId);
        if (slider && display) {
            display.textContent = slider.value + suffix;
            slider.addEventListener("input", function () {
                display.textContent = this.value + suffix;
                recalcBill();
            });
        }
    }

    syncSliderDisplay("billPeople",   "peopleDisplay",   "");
    syncSliderDisplay("billDiscount", "discountDisplay", "%");
    syncSliderDisplay("billTip",      "tipDisplay",      "%");

    if (billRestaurantSelect)  billRestaurantSelect.addEventListener("change",  recalcBill);
    if (billIncludeDeposit)    billIncludeDeposit.addEventListener("change",    recalcBill);
    if (billIncludeDrinks)     billIncludeDrinks.addEventListener("change",     recalcBill);

    /** Core bill calculation function — runs on every input change */
    function recalcBill() {
        if (!billSummaryEl) return;

        const key     = billRestaurantSelect ? billRestaurantSelect.value : "";
        const people  = billPeopleSlider   ? parseInt(billPeopleSlider.value)   : 0;
        const disc    = billDiscountSlider ? parseInt(billDiscountSlider.value) : 0;
        const tipPct  = billTipSlider      ? parseInt(billTipSlider.value)      : 0;
        const withDep = billIncludeDeposit ? billIncludeDeposit.checked : false;
        const withDrk = billIncludeDrinks  ? billIncludeDrinks.checked  : false;

        if (!key || people < 1) {
            billSummaryEl.innerHTML = '<p class="bill-placeholder">Select a restaurant and number of guests above.</p>';
            return;
        }

        const range = PRICE_RANGES[key];
        if (!range) return;

        const avgPrice   = (range.low + range.high) / 2;
        const foodTotal  = avgPrice   * people;
        const drinksAmt  = withDrk   ? 15 * people : 0;
        const subtotal   = foodTotal + drinksAmt;
        const discAmt    = subtotal   * (disc / 100);
        const afterDisc  = subtotal   - discAmt;
        const gst        = afterDisc  * 0.10;         // 10% GST (Australia)
        const beforeTip  = afterDisc  + gst;
        const tipAmt     = beforeTip  * (tipPct / 100);
        const totalBill  = beforeTip  + tipAmt;
        const remaining  = totalBill  - (withDep ? range.deposit : 0);

        let html = `
            <div class="bill-row"><span>Restaurant</span><span>${key}</span></div>
            <div class="bill-row"><span>Guests</span><span>${people}</span></div>
            <div class="bill-row"><span>Avg. food per person</span><span>$${avgPrice.toFixed(2)}</span></div>
            <div class="bill-row"><span>Food subtotal</span><span>$${foodTotal.toFixed(2)}</span></div>
        `;
        if (withDrk)  html += `<div class="bill-row"><span>Drinks est. ($15/person)</span><span>$${drinksAmt.toFixed(2)}</span></div>`;
        if (disc > 0) html += `<div class="bill-row discount"><span>Discount (${disc}%)</span><span>−$${discAmt.toFixed(2)}</span></div>`;
        html += `<div class="bill-row gst"><span>GST (10%)</span><span>$${gst.toFixed(2)}</span></div>`;
        if (tipPct > 0) html += `<div class="bill-row tip"><span>Tip (${tipPct}%)</span><span>$${tipAmt.toFixed(2)}</span></div>`;
        if (withDep)    html += `<div class="bill-row deposit"><span>Deposit paid</span><span>−$${range.deposit.toFixed(2)}</span></div>`;
        html += `<div class="bill-total"><span>Estimated Total</span><span>$${totalBill.toFixed(2)}</span></div>`;
        if (withDep)    html += `<div class="bill-remaining">Amount due at restaurant: $${remaining.toFixed(2)}</div>`;
        html += `
            <div style="margin-top:20px;text-align:center;">
                <a href="reservation.html?restaurant=${encodeURIComponent(key)}" class="button" style="margin:0">
                    Reserve at ${key}
                </a>
            </div>
        `;

        billSummaryEl.innerHTML = html;
    }

    // Initial render
    recalcBill();

}); // end DOMContentLoaded


/* ================================================================
   GLOBAL HELPER – used by recommend page result cards
   ================================================================ */

/**
 * Stores the selected restaurant in localStorage and navigates
 * to the reservation page.
 * Called via onclick in dynamically-generated recommend cards.
 */
function selectRecommendedRestaurant(restaurantName) {
    localStorage.setItem("selectedRestaurant", restaurantName);
    window.location.href = "reservation.html";
}
