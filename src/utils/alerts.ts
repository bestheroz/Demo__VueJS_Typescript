import { locale, Message, MessageBox } from "vuetify-pro-dialog";
import Vuetify from "@/plugins/vuetify";
import store from "@/stores";
import { useConfigStore } from "@/stores/config";
import { storeToRefs } from "pinia";
import { nextTick } from "vue";

locale.setMessage("ko", {
  "dialog.cancel.text": "취소",
  "dialog.ok.text": "확인",
});

locale.set("ko_KR");

const { globalTheme } = storeToRefs(useConfigStore(store));
export function toastSuccess(message: string, timer = 2_000): void {
  // 메시지를 하나만 띄우기 위해 closeAll 우선 수행
  toastCloseAll().then(async () => {
    Message.success(message, {
      timeout: timer,
      position: "bottom",
      showIcon: true,
      // 라이브러리 버그인지 dark 테마일 때 color: "var(--v-success-base)" 가 동작하지 않아서 아래와 같읕 방법을 사용한다.
      // 추후 라이브러리 vue3 교체 시 제거될 로직
      color: (globalTheme.value === "dark"
        ? Vuetify.framework.theme.themes.dark.success
        : Vuetify.framework.theme.themes.light.success) as string,
    });
    await applyMultipleSnackbarContent(message);
    await changeHtmlInSnack();
  });
}

export function toastInfo(message: string, timer = 5_000): void {
  // 메시지를 하나만 띄우기 위해 closeAll 우선 수행
  toastCloseAll().then(async () => {
    Message.notify.info(message, {
      timeout: timer,
      position: "top",
      showIcon: true,
      color: (globalTheme.value === "dark"
        ? Vuetify.framework.theme.themes.dark.info
        : Vuetify.framework.theme.themes.light.info) as string,
    });
    await applyMultipleSnackbarContent(message);
    await changeHtmlInSnack();
  });
}

export function toastWarning(message: string, timer = 10_000): void {
  // 메시지를 하나만 띄우기 위해 closeAll 우선 수행
  toastCloseAll().then(async () => {
    Message.notify.warning(message, {
      timeout: timer,
      position: "top",
      showIcon: true,
      color: (globalTheme.value === "dark"
        ? Vuetify.framework.theme.themes.dark.warning
        : Vuetify.framework.theme.themes.light.warning) as string,
    });
    await applyMultipleSnackbarContent(message);
    await changeHtmlInSnack();
  });
}

export function toastError(message: string, timer = 60_000): void {
  // 메시지를 하나만 띄우기 위해 closeAll 우선 수행
  toastCloseAll().then(async () => {
    Message.notify.error(message, {
      timeout: timer,
      position: "top",
      showIcon: true,
      color: (globalTheme.value === "dark"
        ? Vuetify.framework.theme.themes.dark.error
        : Vuetify.framework.theme.themes.light.error) as string,
    });
    await applyMultipleSnackbarContent(message);
    await changeHtmlInSnack();
  });
}

async function applyMultipleSnackbarContent(message: string) {
  if (message.lastIndexOf("\n") === -1) {
    return;
  }
  await nextTick();
  const selectors = document.querySelectorAll(".v-snack__content");
  selectors?.forEach((selector) => {
    if (selector?.innerHTML) {
      selector.innerHTML = selector.innerHTML.split("\n").join("<br>");
    }
  });
}
async function changeHtmlInSnack() {
  await nextTick();
  const btnSelectors = document.querySelectorAll(
    ".v-snack__action .v-btn__content",
  );
  btnSelectors?.forEach((btnSelector) => {
    if (btnSelector?.innerHTML) {
      btnSelector.innerHTML = "닫기";
    }
  });
}

export async function toastCloseAll(): Promise<void> {
  Message.closeAll();
  await nextTick();
}

export async function confirm(
  title: string,
  text: string,
  confirmButtonText = "확인",
  cancelButtonText = "취소",
): Promise<boolean> {
  return MessageBox.confirm(text, title, {
    type: "info",
    icon: "mdi-alert-octagram",
    showIcon: true,
    actions: {
      true: { text: confirmButtonText },
      false: { text: cancelButtonText },
    },
  });
}

export async function confirmDelete(
  text?: string,
  title = "삭제 하시겠습니까?",
  confirmButtonText = "확인",
  cancelButtonText = "취소",
): Promise<boolean> {
  return MessageBox.confirm(text ?? title, {
    title: title,
    type: "error",
    icon: "mdi-delete-alert",
    showIcon: true,
    actions: {
      true: { text: confirmButtonText },
      false: { text: cancelButtonText },
    },
  });
}

export async function prompt(
  title: string,
  inputPlaceholder = "값을 입력하세요",
): Promise<string | undefined> {
  let text: string | undefined;
  await MessageBox.prompt(title, {
    title: title,
    type: "error",
    icon: "mdi-keyboard",
    textFieldProps: {
      placeholder: inputPlaceholder,
    },
    showIcon: true,
    actions: {
      true: { text: "확인" },
      false: { text: "취소" },
    },
    beforeClose: (v: string) => {
      text = v;
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 2000);
      });
    },
  });
  return text;
}

export async function promptPassword(
  title: string,
  inputPlaceholder = "비밀번호를 입력 해 주세요",
): Promise<string | undefined> {
  let text: string | undefined;
  await MessageBox.prompt(title, {
    title: title,
    type: "error",
    icon: "mdi-shield-key",
    textFieldProps: {
      type: "password",
      autocomplete: "new-password",
      placeholder: inputPlaceholder,
    },
    showIcon: true,
    actions: {
      true: { text: "확인" },
      false: { text: "취소" },
    },
    beforeClose: (v: string) => {
      text = v;
      return new Promise((resolve) => {
        setTimeout(() => resolve(true), 2000);
      });
    },
  });
  return text;
}
