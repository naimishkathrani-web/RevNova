// RevNova Platform JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initMobileMenu();
    initTabs();
    initFormValidation();
    initProcessingOverlays();
    initMigrationWizard();
    initDataTables();
    initCollapsibleSidebar();
    highlightActivePage();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            this.innerHTML = mainNav.classList.contains('active') ? 
                '<i class="fas fa-times"></i>' : 
                '<i class="fas fa-bars"></i>';
        });
    }
}

// Tab System
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showFieldError(field, 'This field is required');
                } else {
                    clearFieldError(field);
                }
            });
            
            // Email validation
            const emailFields = this.querySelectorAll('input[type="email"]');
            emailFields.forEach(field => {
                if (field.value && !isValidEmail(field.value)) {
                    isValid = false;
                    showFieldError(field, 'Please enter a valid email address');
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showToast('Please fill in all required fields correctly', 'error');
            }
        });
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Field error handling
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #dc3545; font-size: 0.75rem; margin-top: 0.25rem;';
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 0.375rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid #00A1E0;
        z-index: 10000;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    if (type === 'success') {
        toast.style.borderLeftColor = '#2E844A';
    } else if (type === 'error') {
        toast.style.borderLeftColor = '#dc3545';
    } else if (type === 'warning') {
        toast.style.borderLeftColor = '#FE9339';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Processing Overlay Functions
function initProcessingOverlays() {
    // Create global processing overlay if it doesn't exist
    if (!document.getElementById('processing-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'processing-overlay';
        overlay.className = 'processing-overlay';
        overlay.innerHTML = `
            <div class="processing-content">
                <div class="processing-spinner"></div>
                <p class="processing-message">Processing...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
}

function showProcessing(message = 'Processing...') {
    const overlay = document.getElementById('processing-overlay');
    const messageEl = overlay.querySelector('.processing-message');
    
    messageEl.textContent = message;
    overlay.style.display = 'flex';
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function hideProcessing() {
    const overlay = document.getElementById('processing-overlay');
    overlay.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Migration Wizard Navigation
function initMigrationWizard() {
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = this.closest('.migration-wizard-container');
            const nextStepId = this.getAttribute('data-next');
            
            if (nextStepId) {
                // TODO: Show processing overlay here for validation
                showProcessing('Validating and moving to next step...');
                
                // Simulate processing delay
                setTimeout(() => {
                    hideProcessing();
                    navigateToStep(nextStepId);
                }, 1500);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const prevStepId = this.getAttribute('data-prev');
            if (prevStepId) {
                navigateToStep(prevStepId);
            }
        });
    });
}

function navigateToStep(stepId) {
    // In a real application, this would navigate to the actual page
    // For demo purposes, we'll just show a message
    showToast(`Navigating to ${stepId}`, 'info');
}

// Data Table Enhancements
function initDataTables() {
    const tables = document.querySelectorAll('.data-table');
    
    tables.forEach(table => {
        const headers = table.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            if (header.classList.contains('sortable')) {
                header.style.cursor = 'pointer';
                header.addEventListener('click', () => {
                    sortTable(table, index);
                });
            }
        });
    });
}

// Collapsible Sidebar for Onboarding
function initCollapsibleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // Handle week toggle buttons
    const weekToggles = sidebar.querySelectorAll('.week-toggle');
    weekToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const weekSection = toggle.closest('.week-section');
            const isExpanded = weekSection.classList.contains('expanded');
            
            // Toggle expanded state
            weekSection.classList.toggle('expanded');
            toggle.setAttribute('aria-expanded', !isExpanded);
            
            // Rotate chevron
            const chevron = toggle.querySelector('.chevron');
            if (chevron) {
                chevron.style.transform = !isExpanded ? 'rotate(90deg)' : 'rotate(0deg)';
            }
        });
    });

    // Auto-expand the week containing the current page
    try {
        const currentFile = window.location.pathname.split('/').pop();
        const activeLink = sidebar.querySelector(`a[href="${currentFile}"]`);
        
        if (activeLink) {
            // Find the parent week section
            const weekSection = activeLink.closest('.week-section');
            if (weekSection) {
                weekSection.classList.add('expanded');
                const toggle = weekSection.querySelector('.week-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'true');
                    const chevron = toggle.querySelector('.chevron');
                    if (chevron) {
                        chevron.style.transform = 'rotate(90deg)';
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error expanding active week:', err);
    }
}

function sortTable(table, columnIndex) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    const header = table.querySelectorAll('th')[columnIndex];
    const isAscending = !header.classList.contains('asc');
    
    // Clear previous sort indicators
    table.querySelectorAll('th').forEach(th => {
        th.classList.remove('asc', 'desc');
    });
    
    // Set current sort indicator
    header.classList.add(isAscending ? 'asc' : 'desc');
    
    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        
        if (isAscending) {
            return aValue.localeCompare(bValue, undefined, { numeric: true });
        } else {
            return bValue.localeCompare(aValue, undefined, { numeric: true });
        }
    });
    
    // Reappend sorted rows
    rows.forEach(row => tbody.appendChild(row));
}

// Mock Data Generation for Demo
function generateMockData(count = 5) {
    const statuses = ['Completed', 'In Progress', 'Draft'];
    const objects = ['Product', 'Price Book', 'Quote', 'Contract', 'Opportunity'];
    
    return Array.from({ length: count }, (_, i) => ({
        id: `MIG-${1000 + i}`,
        name: `Migration Project ${i + 1}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        objects: objects[Math.floor(Math.random() * objects.length)],
        progress: Math.floor(Math.random() * 100),
        lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    }));
}

// Highlight Active Sidebar Link
function highlightActivePage() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const currentFile = window.location.pathname.split('/').pop();
    
    sidebar.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href === currentFile) {
            link.classList.add('active');
            link.style.cssText = 'background: #667eea; color: #fff; font-weight: 500;';
        }
    });
}

// Export functions for global use
window.RevNova = {
    showProcessing,
    hideProcessing,
    showToast,
    generateMockData
};