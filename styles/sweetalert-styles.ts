import Swal from "sweetalert2"

// Configuração global para o SweetAlert2
export const configureSweet = () => {
  // Definir estilos globais para todos os alertas
  Swal.mixin({
    customClass: {
      container: "swal-container-higher-z",
      popup: "swal-popup-higher-z",
      header: "swal-header",
      title: "swal-title",
      closeButton: "swal-close",
      icon: "swal-icon",
      image: "swal-image",
      content: "swal-content",
      input: "swal-input",
      actions: "swal-actions",
      confirmButton: "swal-confirm",
      cancelButton: "swal-cancel",
      footer: "swal-footer",
    },
    buttonsStyling: true,
    confirmButtonColor: "#F2BE13",
    cancelButtonColor: "#d33",
    background: "#000",
    color: "#F2BE13",
    backdrop: `rgba(0,0,0,0.4)`,
    allowOutsideClick: false,
    // Aumentar o z-index para garantir que fique acima do modal
    target: document.body, // Garantir que o SweetAlert seja renderizado no body, não dentro do modal
  })
}

// Função para mostrar alerta de sucesso com o nome do operador
export const showSuccessAlert = (operatorName: string, message = "Entrada Registrada") => {
  return Swal.fire({
    title: "Sucesso!",
    html: `<div>${message} pelo Operador <strong>${operatorName}</strong></div>`,
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#F2BE13",
    background: "#000",
    color: "#F2BE13",
    customClass: {
      container: "swal-container-higher-z",
      popup: "swal-popup-higher-z",
    },
  })
}

// Função para mostrar alerta de erro
export const showErrorAlert = (message: string) => {
  return Swal.fire({
    title: "Erro!",
    text: message,
    icon: "error",
    confirmButtonText: "OK",
    confirmButtonColor: "#F2BE13",
    background: "#000",
    color: "#F2BE13",
    customClass: {
      container: "swal-container-higher-z",
      popup: "swal-popup-higher-z",
    },
  })
}

