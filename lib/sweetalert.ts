import Swal from 'sweetalert2';

export const showSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#3b82f6',
  });
};

export const showError = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#3b82f6',
  });
};

export const showWarning = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#3b82f6',
  });
};

export const showInfo = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'info',
    title,
    text,
    confirmButtonColor: '#3b82f6',
  });
};

export const showConfirm = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal',
  });
};

export const showToast = (title: string, icon: 'success' | 'error' | 'warning' | 'info') => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    customClass: {
      popup: 'colored-toast',
    },
    showClass: {
      popup: 'animate__animated animate__fadeInDownBig'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutUpBig' 
    },
    iconColor: 'white',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};
