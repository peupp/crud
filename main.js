// Main JavaScript file for static HTML pages

// Form validation and interaction utilities
class FormUtils {
    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateCPF(cpf) {
        if (!cpf) return true; // Optional field
        const digits = cpf.replace(/\D/g, "");
        if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;
        
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(digits.charAt(i)) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(digits.charAt(9))) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(digits.charAt(i)) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        return rev === parseInt(digits.charAt(10));
    }

    static formatPhone(phone) {
        if (!phone) return "";
        const digits = phone.replace(/\D/g, "");
        if (digits.length === 11) {
            return `+55 (${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
        }
        if (digits.length === 10) {
            return `+55 (${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
        }
        return phone;
    }

    static maskCPF(input) {
        let value = input.value.replace(/\D/g, "");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d)/, "$1.$2");
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        input.value = value;
    }

    static maskPhone(input) {
        let value = input.value.replace(/\D/g, "");
        if (value.length <= 11) {
            value = value.replace(/(\d{2})(\d)/, "($1) $2");
            value = value.replace(/(\d{5})(\d)/, "$1-$2");
        }
        input.value = value;
    }

    static maskCEP(input) {
        let value = input.value.replace(/\D/g, "");
        value = value.replace(/(\d{5})(\d)/, "$1-$2");
        input.value = value;
    }
}

// Search and filter functionality
class SearchFilter {
    constructor() {
        this.debounceTimer = null;
        this.debounceDelay = 300;
    }

    debounce(func, delay = this.debounceDelay) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, delay);
    }

    filterTable(searchTerm, filters = {}) {
        const table = document.querySelector('.table tbody');
        if (!table) return;

        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            let shouldShow = true;

            // Search term filter
            if (searchTerm) {
                const text = row.textContent.toLowerCase();
                shouldShow = text.includes(searchTerm.toLowerCase());
            }

            // Additional filters can be added here
            if (filters.vipOnly && shouldShow) {
                const vipBadge = row.querySelector('.badge-secondary');
                shouldShow = vipBadge !== null;
            }

            row.style.display = shouldShow ? '' : 'none';
        });
    }

    setupSearchListeners() {
        const searchInput = document.getElementById('searchTerm');
        const vipCheckbox = document.getElementById('vipOnly');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.debounce(() => {
                    const filters = {
                        vipOnly: vipCheckbox?.checked || false
                    };
                    this.filterTable(e.target.value, filters);
                });
            });
        }

        if (vipCheckbox) {
            vipCheckbox.addEventListener('change', (e) => {
                const searchTerm = searchInput?.value || '';
                const filters = {
                    vipOnly: e.target.checked
                };
                this.filterTable(searchTerm, filters);
            });
        }
    }
}

// Toast notification system
class Toast {
    static show(message, type = 'info', duration = 3000) {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        // Add to container
        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        }, duration);
    }

    static success(message, duration) {
        this.show(message, 'success', duration);
    }

    static error(message, duration) {
        this.show(message, 'error', duration);
    }

    static warning(message, duration) {
        this.show(message, 'warning', duration);
    }
}

// Modal management
class Modal {
    static open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    static close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    static setupCloseOnOutsideClick(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close(modalId);
                }
            });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize search and filter
    const searchFilter = new SearchFilter();
    searchFilter.setupSearchListeners();

    // Setup form masks
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', () => FormUtils.maskPhone(input));
    });

    document.querySelectorAll('input[data-mask="cpf"]').forEach(input => {
        input.addEventListener('input', () => FormUtils.maskCPF(input));
    });

    document.querySelectorAll('input[data-mask="cep"]').forEach(input => {
        input.addEventListener('input', () => FormUtils.maskCEP(input));
    });

    // Setup modal close on outside click
    Modal.setupCloseOnOutsideClick('clientModal');
    Modal.setupCloseOnOutsideClick('patientModal');

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    console.log('Sistema de Gestão - Interface carregada com sucesso!');
});

// Global functions for onclick handlers
function openClientModal() {
    Modal.open('clientModal');
}

function closeClientModal() {
    Modal.close('clientModal');
}

function openPatientModal() {
    Modal.open('patientModal');
}

function closePatientModal() {
    Modal.close('patientModal');
}

// Form submission handlers
function handleClientSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Basic validation
    if (!data.name?.trim()) {
        Toast.error('Nome é obrigatório');
        return;
    }
    
    if (data.email && !FormUtils.validateEmail(data.email)) {
        Toast.error('Email inválido');
        return;
    }
    
    if (data.cpf && !FormUtils.validateCPF(data.cpf)) {
        Toast.error('CPF inválido');
        return;
    }
    
    // Simulate save
    Toast.success('Cliente salvo com sucesso!');
    closeClientModal();
    event.target.reset();
}

function handlePatientSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Basic validation
    if (!data.name?.trim()) {
        Toast.error('Nome é obrigatório');
        return;
    }
    
    // Simulate save
    Toast.success('Paciente salvo com sucesso!');
    closePatientModal();
    event.target.reset();
}