export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { setGlobalDispatcher, Agent } = await import("undici")
    setGlobalDispatcher(
      new Agent({
        connect: { family: 4 } as never,
      })
    )
  }
}