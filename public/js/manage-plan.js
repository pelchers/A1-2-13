document.addEventListener('DOMContentLoaded', () => {
    const changePlanButton = document.querySelector('.change-plan-btn');
    changePlanButton.addEventListener('click', () => {
        window.location.href = '/plans.html';
    });
}); 