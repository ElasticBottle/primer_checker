export const validateFormat = (content) => {
    let format = />fwd[\s\S]{2}[ACGTacgt]+[\s\S]{1,2}>rev[\s\S]{1,2}[ACGTacgt]+[\s\S]{1,2}>prb[\s\S]{1,2}[ACGTacgt]+[\s\S]{1,2}/
    let correct_format = format.exec(content)
    return correct_format !== null
}