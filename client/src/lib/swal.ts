import Swal, { type SweetAlertIcon } from "sweetalert2";

export const handleAlert = (msg: string, icon: SweetAlertIcon) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon: icon,
    title: msg || "Something went wrong",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,

    background: "#e0f2fe", // sky blue background
    color: "#0c4a6e", // dark blue text
    iconColor: "#0284c7", // strong blue icon

    customClass: {
      popup: "eduvi-toast",
    },

    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};
