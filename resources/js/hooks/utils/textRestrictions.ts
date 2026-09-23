export function allowNameText(value: string) {
  // Keep: letters + combining marks, spaces, apostrophe, hyphen
  return value.replace(/[^\p{L}\p{M}\s'-]/gu, '');
}
export function allowNumbersOnly(value: string) {
    return value.replace(/\D/g, '');
}
export const removeEmojis = (value: string) => {
    return value.replace(
        /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu,
        '',
    );
};
export function allowTwoLettersOnly(value: string) {
  return value
    .replace(/[^a-zA-Z]/g, '') 
    .slice(0, 2);              
}
