const form = document.querySelector("[data-contact-form]");

if (form) {
    const fields = [...form.querySelectorAll("input[required], textarea[required]")];
    const errorSummary = form.querySelector("[data-form-error]");
    const status = form.querySelector("[data-form-status]");
    const messages = {
        "contact-name": "Please enter your name.",
        "contact-email": "Please enter your email address.",
        "contact-message": "Please enter a message."
    };

    form.noValidate = true;

    function validateField(field) {
        const error = document.getElementById(`${field.id}-error`);
        let message = "";

        if (field.validity.valueMissing) {
            message = messages[field.id];
        } else if (field.validity.typeMismatch) {
            message = "Enter a valid email address, such as name@example.com.";
        }

        field.setAttribute("aria-invalid", String(Boolean(message)));
        error.textContent = message;
        error.hidden = !message;
        return !message;
    }

    fields.forEach((field) => {
        field.addEventListener("blur", () => validateField(field));
        field.addEventListener("input", () => {
            if (field.getAttribute("aria-invalid") === "true") {
                validateField(field);
            }
        });
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const invalidFields = fields.filter((field) => !validateField(field));

        if (invalidFields.length > 0) {
            errorSummary.textContent = `Please correct ${invalidFields.length === 1 ? "the highlighted field" : "the highlighted fields"} before continuing.`;
            errorSummary.hidden = false;
            errorSummary.focus();
            status.textContent = "";
            return;
        }

        errorSummary.hidden = true;
        status.textContent = "Opening your email app with your message.";

        const data = new FormData(form);
        const subject = encodeURIComponent(`Portfolio message from ${data.get("name")}`);
        const body = encodeURIComponent(
            `Name: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`
        );

        window.location.href = `mailto:bbono@my.campus.edu?subject=${subject}&body=${body}`;
    });
}
