        const updateModal = document.getElementById("updateModal");
        const updateTrigger = document.getElementById("update-trigger");
        const closeBtn = document.getElementById("closeBtn");
        const dismissBtn = document.getElementById("dismissBtn");

        window.addEventListener("load", () => {
            updateModal.classList.add("active");
        });

        function closeModal() {
            updateModal.classList.remove("active");
        }

        closeBtn.addEventListener("click", closeModal);
        dismissBtn.addEventListener("click", closeModal);
        updateTrigger.addEventListener("click", () => {
            updateModal.classList.add("active");
        });

        updateModal.addEventListener("click", (e) => {
            if (e.target === updateModal) {
                closeModal();
            }
        });
