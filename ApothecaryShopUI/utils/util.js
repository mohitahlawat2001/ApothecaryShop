export const addAbbreviation = (num) => {
    const number = parseFloat(num)
    if(number < 1000) return number.toString()
    const suffix = ['k', 'M', 'B', 'T'];
    const magnitude = Math.floor(Math.log10(number));
    const suffixIndex = Math.floor(magnitude/3) - 1;
    const divisor = Math.pow(10, (suffixIndex + 1) * 3);

    const quotient = number/divisor;
    const remainder = number%divisor;
    let abbreviatedNumber = `${quotient.toFixed(1)}${suffix[suffixIndex]}`

    if(remainder > 0) {
        abbreviatedNumber += '+';
    }
    return abbreviatedNumber;
}
