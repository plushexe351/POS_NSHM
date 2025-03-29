export function numberToWords(num) {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convertBelowThousand(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + " " + ones[n % 10] + " ";
    return (
      ones[Math.floor(n / 100)] + " Hundred " + convertBelowThousand(n % 100)
    );
  }

  function convertToWords(n) {
    if (n === 0) return "Zero";

    let result = "";

    if (Math.floor(n / 10000000) > 0) {
      result += convertBelowThousand(Math.floor(n / 10000000)) + "Crore ";
      n %= 10000000;
    }
    if (Math.floor(n / 100000) > 0) {
      result += convertBelowThousand(Math.floor(n / 100000)) + "Lakh ";
      n %= 100000;
    }
    if (Math.floor(n / 1000) > 0) {
      result += convertBelowThousand(Math.floor(n / 1000)) + "Thousand ";
      n %= 1000;
    }
    if (Math.floor(n / 100) > 0) {
      result += convertBelowThousand(Math.floor(n / 100)) + "Hundred ";
      n %= 100;
    }
    if (n > 0) {
      result += "and " + convertBelowThousand(n);
    }

    return result.trim();
  }

  function convertRupeesToWords(amount) {
    let [rupees, paise] = amount.toFixed(2).split(".");
    let words = "Rupees " + convertToWords(parseInt(rupees));
    if (parseInt(paise) > 0) {
      words += " and " + convertToWords(parseInt(paise)) + " Paise";
    }
    return words + " only";
  }

  return convertRupeesToWords(num);
}
