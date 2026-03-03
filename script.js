document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('booking-form');
    const toast = document.getElementById('toast');
    
    const phoneInput = document.getElementById('phone');
    const birthdateInput = document.getElementById('birthdate');
    
    const tariffRadios = document.querySelectorAll('input[name="tariff"]');
    const carSelect = document.getElementById('car');
    const carSelectionDiv = document.getElementById('car-selection');
    
    const progressBar = document.getElementById('profile-progress');
    const requiredFields = ['fio', 'email', 'phone', 'birthdate', 'start_date', 'start_time', 'address', 'agree'];
    
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                value = value.substring(1);
            }
            
            let formattedValue = '+7';
            
            if (value.length > 0) {
                formattedValue += ' (' + value.substring(0, 3);
            }
            if (value.length >= 4) {
                formattedValue += ') ' + value.substring(3, 6);
            }
            if (value.length >= 7) {
                formattedValue += '-' + value.substring(6, 8);
            }
            if (value.length >= 9) {
                formattedValue += '-' + value.substring(8, 10);
            }
            
            e.target.value = formattedValue;
        }
        
        validateField(e.target);
    });
    
    birthdateInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            let formattedValue = '';
            
            if (value.length > 2) {
                formattedValue += value.substring(0, 2) + '.' + value.substring(2, 4);
            } else {
                formattedValue += value;
            }
            
            if (value.length >= 5) {
                formattedValue += '.' + value.substring(4, 8);
            }
            
            e.target.value = formattedValue;
        }
        
        validateField(e.target);
    });
    
    function updateCarOptions(tariff) {
        if (tariff) {
            carSelectionDiv.classList.remove('hidden');
            
            document.querySelectorAll('#car optgroup').forEach(group => {
                group.style.display = 'none';
            });
            
            let targetGroup;
            switch(tariff) {
                case 'economy':
                    targetGroup = document.getElementById('economy-cars');
                    break;
                case 'comfort':
                    targetGroup = document.getElementById('comfort-cars');
                    break;
                case 'business':
                    targetGroup = document.getElementById('business-cars');
                    break;
            }
            
            if (targetGroup) {
                targetGroup.style.display = 'block';
                carSelect.value = '';
                validateField(carSelect);
            }
        } else {
            carSelectionDiv.classList.add('hidden');
            carSelect.required = false;
        }
    }
    
    tariffRadios.forEach(radio => {
        radio.addEventListener('change', function(e) {
            updateCarOptions(e.target.value);
        });
    });
    
    const selectedTariff = document.querySelector('input[name="tariff"]:checked');
    if (selectedTariff) {
        updateCarOptions(selectedTariff.value);
    }
    
    function validateField(field) {
        const fieldId = field.id;
        const errorDiv = document.getElementById(`${fieldId}-error`);
        
        if (!errorDiv) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        if (field.required && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Это поле обязательно для заполнения';
        } else {
            switch(field.type) {
                case 'email':
                    if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'Введите корректный email (пример: name@domain.ru)';
                    }
                    break;
                    
                case 'tel':
                    if (field.value && field.value.replace(/\D/g, '').length !== 11) {
                        isValid = false;
                        errorMessage = 'Телефон должен содержать 11 цифр (например: +7 999 123-45-67)';
                    }
                    break;
                    
                case 'date':
                    if (field.value) {
                        const selectedDate = new Date(field.value);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        if (selectedDate < today) {
                            isValid = false;
                            errorMessage = 'Дата не может быть в прошлом';
                        }
                    }
                    break;
                    
                case 'file':
                    if (field.required && !field.files.length) {
                        isValid = false;
                        errorMessage = 'Загрузите скан водительских прав';
                    } else if (field.files.length > 0) {
                        const file = field.files[0];
                        const maxSize = 5 * 1024 * 1024;
                        
                        if (file.size > maxSize) {
                            isValid = false;
                            errorMessage = 'Файл слишком большой (максимум 5MB)';
                        }
                    }
                    break;
            }
            
            switch(fieldId) {
                case 'fio':
                    if (field.value && field.value.length < 5) {
                        isValid = false;
                        errorMessage = 'ФИО должно содержать минимум 5 символов';
                    } else if (field.value && !/^[а-яА-Яa-zA-Z\s-]+$/.test(field.value)) {
                        isValid = false;
                        errorMessage = 'ФИО может содержать только буквы, пробелы и дефисы';
                    }
                    break;
                    
                case 'birthdate':
                    if (field.value) {
                        const parts = field.value.split('.');
                        if (parts.length === 3) {
                            const day = parseInt(parts[0]);
                            const month = parseInt(parts[1]);
                            const year = parseInt(parts[2]);
                            
                            if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2024) {
                                isValid = false;
                                errorMessage = 'Введите корректную дату (ДД.ММ.ГГГГ)';
                            } else {
                                const age = 2025 - year;
                                if (age < 18) {
                                    isValid = false;
                                    errorMessage = 'Вам должно быть не менее 18 лет';
                                }
                            }
                        } else {
                            isValid = false;
                            errorMessage = 'Формат даты: ДД.ММ.ГГГГ';
                        }
                    }
                    break;
                    
                case 'start_time':
                    if (field.value) {
                        const time = field.value.split(':');
                        const hour = parseInt(time[0]);
                        
                        if (hour < 8 || hour > 23) {
                            isValid = false;
                            errorMessage = 'Время аренды доступно с 8:00 до 23:00';
                        }
                    }
                    break;
                    
                case 'car':
                    if (field.required && !field.value) {
                        isValid = false;
                        errorMessage = 'Выберите автомобиль';
                    }
                    break;
                    
                case 'agree':
                    if (!field.checked) {
                        isValid = false;
                        errorMessage = 'Необходимо согласиться с условиями аренды';
                    }
                    break;
            }
        }
        
        if (!isValid) {
            field.setAttribute('aria-invalid', 'true');
            field.classList.add('is-invalid');
            errorDiv.textContent = errorMessage;
            errorDiv.classList.add('show');
        } else {
            field.removeAttribute('aria-invalid');
            field.classList.remove('is-invalid');
            errorDiv.textContent = '';
            errorDiv.classList.remove('show');
        }
        
        updateProgress();
        
        return isValid;
    }
    
    function updateProgress() {
        let filledCount = 0;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    if (field.checked) filledCount++;
                } else if (field.value && field.value.trim() !== '') {
                    filledCount++;
                }
            }
        });
        
        const progress = (filledCount / requiredFields.length) * 100;
        progressBar.value = progress;
        progressBar.textContent = Math.round(progress) + '%';
    }
    
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            validateField(this);
        });
        
        field.addEventListener('change', function() {
            validateField(this);
        });
    });
    
    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.classList.add('show');
        
        if (isError) {
            toast.classList.add('error');
        } else {
            toast.classList.remove('error');
        }
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let firstInvalidField = null;
        let isValid = true;
        
        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (!validateField(field) && !firstInvalidField) {
                firstInvalidField = field;
                isValid = false;
            }
        });
        
        if (!isValid) {
            if (firstInvalidField) {
                firstInvalidField.focus();
                firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            showToast('Пожалуйста, исправьте ошибки в форме', true);
            return;
        }
        
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        showToast('Бронирование успешно отправлено! Мы свяжемся с вами в ближайшее время.');
        
        localStorage.setItem('carshare_draft', JSON.stringify({
            data: data,
            timestamp: new Date().toISOString()
        }));
    });
    
    form.addEventListener('reset', function() {
        form.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        form.querySelectorAll('[aria-invalid="true"]').forEach(field => {
            field.removeAttribute('aria-invalid');
            field.classList.remove('is-invalid');
        });
        
        const defaultTariff = document.querySelector('input[name="tariff"]:checked');
        if (defaultTariff) {
            updateCarOptions(defaultTariff.value);
        }
        
        updateProgress();
        
        showToast('Форма очищена');
    });
    
    const draft = localStorage.getItem('carshare_draft');
    if (draft) {
        const draftData = JSON.parse(draft);
        const draftTime = new Date(draftData.timestamp);
        const now = new Date();
        const hoursDiff = (now - draftTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            if (confirm('У вас есть несохраненный черновик. Восстановить?')) {
                console.log('Восстанавливаем черновик:', draftData.data);
            }
        } else {
            localStorage.removeItem('carshare_draft');
        }
    }
    
    updateProgress();
});