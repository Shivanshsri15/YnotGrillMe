/** Parse a fetch body as Server-Sent Events. */
export async function* readSse(
  response: Response,
): AsyncGenerator<{ event: string; data: string }> {
  if (!response.body) {
    throw new Error('No response body')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = 'message'
  let dataLines: string[] = []

  const flush = (): { event: string; data: string } | null => {
    if (dataLines.length === 0) {
      eventName = 'message'
      return null
    }
    const packet = {
      event: eventName,
      data: dataLines.join('\n'),
    }
    eventName = 'message'
    dataLines = []
    return packet
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let newlineIndex = buffer.indexOf('\n')
    while (newlineIndex !== -1) {
      let line = buffer.slice(0, newlineIndex)
      buffer = buffer.slice(newlineIndex + 1)
      if (line.endsWith('\r')) line = line.slice(0, -1)

      if (line === '') {
        const packet = flush()
        if (packet) yield packet
      } else if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart())
      }

      newlineIndex = buffer.indexOf('\n')
    }
  }

  const trailing = flush()
  if (trailing) yield trailing
}
