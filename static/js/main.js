// main.js
document.addEventListener('DOMContentLoaded', () => {
    // Open modal
    document.querySelectorAll('.open-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-id');
            document.getElementById(modalId).classList.remove('hidden');
        });
    });

    // Close modal
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal-id');
            document.getElementById(modalId).classList.add('hidden');
        });
    });
});
