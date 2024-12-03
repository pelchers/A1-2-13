document.addEventListener('DOMContentLoaded', () => {
    const planButtons = document.querySelectorAll('.select-plan-btn');
    planButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Plan selection is currently not implemented.');
        });
    });
}); 