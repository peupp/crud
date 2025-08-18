// Patient Registration Form Script
class PatientRegistration {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStepIndicator();
        this.updateNavigation();
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('next-btn').addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevStep());
        
        // VIP checkbox
        document.getElementById('vip').addEventListener('change', (e) => this.toggleVIP(e.target.checked));
        
        // Photo upload
        document.getElementById('photo').addEventListener('change', (e) => this.handlePhotoUpload(e));
        
        // Form submission
        document.querySelector('.patient-form').addEventListener('submit', (e) => this.handleSubmit(e));
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStep();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStep();
        }
    }

    updateStep() {
        // Hide all step contents
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step content
        document.getElementById(`step-${this.currentStep}`).classList.add('active');

        // Update step indicator
        this.updateStepIndicator();
        
        // Update navigation
        this.updateNavigation();
    }

    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        // Previous button
        prevBtn.disabled = this.currentStep === 1;

        // Next/Submit buttons
        if (this.currentStep === this.totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }
    }

    toggleVIP(isChecked) {
        const badge = document.querySelector('.vip-badge');
        if (isChecked) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatar = document.querySelector('.avatar');
                avatar.innerHTML = `<img src="${e.target.result}" alt="Patient photo" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
            };
            reader.readAsDataURL(file);
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        
        // Collect form data
        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());
        
        // Show success message (you can replace this with actual submission logic)
        alert('Paciente cadastrado com sucesso!');
        console.log('Patient data:', data);
        
        // Reset form
        this.resetForm();
    }

    resetForm() {
        // Reset to first step
        this.currentStep = 1;
        this.updateStep();
        
        // Clear form
        document.querySelector('.patient-form').reset();
        
        // Reset photo
        const avatar = document.querySelector('.avatar');
        avatar.innerHTML = `
            <svg class="avatar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
        `;
        
        // Hide VIP badge
        document.querySelector('.vip-badge').classList.add('hidden');
    }

    // Validation helper (you can expand this)
    validateStep(step) {
        const stepElement = document.getElementById(`step-${step}`);
        const requiredFields = stepElement.querySelectorAll('input[required], select[required]');
        
        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                alert(`Por favor, preencha o campo "${field.previousElementSibling.textContent}"`);
                return false;
            }
        }
        
        return true;
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PatientRegistration();
});