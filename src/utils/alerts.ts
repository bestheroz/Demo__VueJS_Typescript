import "sweetalert2/dist/sweetalert2.css";
import "@/scss/sweetalert.scss";
import { SweetAlertResult } from "sweetalert2";
import Swal from "sweetalert2/src/sweetalert2.js";

const Toast = Swal.mixin({
  toast: true,
  backdrop: false,
  position: "top",
  showCloseButton: true,
  showConfirmButton: false,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export function toastSuccess(message: string, timer = 3000): void {
  Toast.fire({
    icon: "success",
    timer: timer,
    timerProgressBar: !!timer,
    title: message,
  });
}
export function toastInfo(message: string, timer = 5000): void {
  Toast.fire({
    icon: "info",
    iconColor: "var(--v-info-base)",
    timer: timer,
    timerProgressBar: !!timer,
    title: message,
  });
}
export function toastWarning(message: string, timer?: number): void {
  Toast.fire({
    icon: "warning",
    iconColor: "var(--v-warning-base)",
    timer: timer,
    timerProgressBar: !!timer,
    title: message,
  });
}
export function toastError(message: string, timer?: number): void {
  Toast.fire({
    icon: "error",
    iconColor: "var(--v-error-base)",
    timer: timer,
    timerProgressBar: !!timer,
    title: message,
  });
}
export function toastCloseAll(): void {
  Toast.close();
}

export async function confirm(
  title: string,
  text = "",
  confirmButtonText = "확인",
): Promise<SweetAlertResult> {
  return await Toast.fire({
    title: title,
    text: text,
    icon: "question",
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonColor: "var(--v-primary-base)",
    confirmButtonText: confirmButtonText,
  });
}

export async function confirmDelete(
  title = "삭제 하시겠습니까?",
  text = "",
): Promise<SweetAlertResult> {
  return await Toast.fire({
    title: title,
    text: text,
    icon: "question",
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonColor: "var(--v-primary-base)",
    confirmButtonText: "삭제 하겠습니다",
  });
}
