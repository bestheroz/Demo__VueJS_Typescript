import router from "@/router";

export async function goErrorPage(statusCode: number | string): Promise<void> {
  if (
    !["/", "/login", "/error", "/error/404"].includes(router.currentRoute.path)
  ) {
    await router.replace(`/error/${statusCode}`);
  }
}
