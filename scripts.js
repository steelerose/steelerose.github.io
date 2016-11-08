function TranslateInput() {
	var inputForBinary = $("#txtBinaryInput").val();
	var inputForMorseCode = $("#txtMorseInput").val().toLowerCase();
	var bitsPerDot = $("#ddlDotValue").val();
	$("#txtEncoded").val("");
	var binaryOutput = "";
	var byteSpace = (inputForMorseCode == "" ? " " : "");

	for (a = 0; a < inputForBinary.length; a++) {
		var asciiValue = inputForBinary.charCodeAt(a);
		var binaryValue = "";

		do {
			var tmp = asciiValue % 2;
			asciiValue = (asciiValue - tmp) / 2;
			binaryValue = tmp + binaryValue;
		} while (asciiValue != 0);

		while (binaryValue.length < 8) {
			binaryValue = "0" + binaryValue;
		}

		binaryOutput += binaryValue + byteSpace;
	}

	// If inputForMorseCode has been provided, format binary as Morse Code
	if (inputForMorseCode != "") {
		binaryOutput = FormatAsMorseCode(binaryOutput.split(""), inputForMorseCode, parseInt(bitsPerDot));
	}

	$("#txtEncoded").val(binaryOutput);
}

function FormatAsMorseCode(binaryArray, inputForMorseCode, bitsPerDot) {
	var inputCharIndex = 0
	var morseCodeOutput = ""
	var errorMessages = ""
	var ditDotBreak = "";
	var letterBreak = "";
	var wordBreak = "";
	var isProsign = false;
	var hasError = false;

	// Determine spacing based on bitsPerDot
	for (var b = 0; b < bitsPerDot; b++) {
		ditDotBreak += ".";
		letterBreak += "---";
		wordBreak += "_______";
	}

	// Modify binary output to show message in Morse code
	while (binaryArray.length > 0 && inputCharIndex < inputForMorseCode.length ) {
		if (inputForMorseCode[inputCharIndex] == " ") {
			// END OF WORD
			morseCodeOutput += wordBreak;
			inputCharIndex += 1;
		} else if (inputForMorseCode[inputCharIndex] == "\n" && inputForMorseCode[inputCharIndex + 1] == "\n") {
			// NEW PARAGRAPH
			morseCodeOutput += wordBreak;

			var morsePattern = dictMorseCode["[bt]"];

			for (var p = 0; p < morsePattern.length; p++) {
				for (var pp = 0; pp < morsePattern[p]; pp++) {
					for (var ppp = 0; ppp < bitsPerDot; ppp++) {
						if (binaryArray.length > 0) {
							morseCodeOutput += binaryArray.shift();
						} else {
							errorMessages += "\n\nWARNING: Morse input is too long for Binary input by " + (inputForMorseCode.length - inputCharIndex) + " characters."
							hasError = true;
						}
					}
				}

				if (p + 1 != morsePattern.length) {
					morseCodeOutput += ditDotBreak;
				}
			}

			morseCodeOutput += wordBreak;

			inputCharIndex += 2;
		} else if (inputForMorseCode[inputCharIndex] == "\n") {
			// NEW LINE
			morseCodeOutput += wordBreak;

			var morsePattern = dictMorseCode["[aa]"];

			for (var l = 0; l < morsePattern.length; l++) {
				for (var ll = 0; ll < morsePattern[l]; ll++) {
					for (var lll = 0; lll < bitsPerDot; lll++) {
						if (binaryArray.length > 0) {
							morseCodeOutput += binaryArray.shift();
						} else {
							errorMessages += "\n\nWARNING: Morse input is too long for Binary input by " + (inputForMorseCode.length - inputCharIndex) + " characters."
							hasError = true;
						}
					}
				}

				if (l + 1 != morsePattern.length) {
					morseCodeOutput += ditDotBreak;
				}
			}

			morseCodeOutput += wordBreak;

			inputCharIndex += 1;
		} else if (inputForMorseCode[inputCharIndex] == "[") {
			// START PROSIGN
			isProsign = true;
			inputCharIndex += 1;
		} else if (inputForMorseCode[inputCharIndex] == "]") {
			// END PROSIGN
			isProsign = false;
			inputCharIndex += 1;
		} else {
			// LETTER OR SYMBOL
			var inputChar = inputForMorseCode[inputCharIndex];
			var morsePattern = dictMorseCode[inputChar];

			for (var s = 0; s < morsePattern.length; s++) {
				for (var ss = 0; ss < morsePattern[s]; ss++) {
					for (var sss = 0; sss < bitsPerDot; sss++) {
						if (binaryArray.length > 0) {
							morseCodeOutput += binaryArray.shift();
						} else {
							errorMessages += "\n\nWARNING: Morse input is too long for Binary input by " + (inputForMorseCode.length - inputCharIndex) + " characters."
							hasError = true;
						}
					}
				}

				if (s + 1 != morsePattern.length) {
					morseCodeOutput += ditDotBreak;
				}
			}

			if (!isProsign && inputForMorseCode[inputCharIndex + 1] != " " && inputForMorseCode[inputCharIndex + 1] != "\n") {
				morseCodeOutput += letterBreak;
			}

			inputCharIndex += 1;
		}
	}

	if ($("#ddlLineBreaks").val() == "columns") {
		console.log(morseCodeOutput.replace(/\-\-\-/g, "\n"));
		console.log(morseCodeOutput.replace(/\_\_\_\_\_\_\_/g, "\n"));
		console.log(morseCodeOutput.replace(/\-\-\-/g, "\n").replace(/\_\_\_\_\_\_\_/g, "\n\n"));
		morseCodeOutput = morseCodeOutput.replace(/\-\-\-/g, "\n").replace(/\_\_\_\_\_\_\_/g, "\n\n");
	}

	morseCodeOutput += errorMessages;

	if ($("#chkReplaceWhitespace").is(":checked")) {
		morseCodeOutput = morseCodeOutput.replace(/\./g, " ").replace(/\-/g, " ").replace(/\_/g, " ");
	}

	if (!hasError && binaryArray.length > 0) {
		morseCodeOutput += wordBreak + wordBreak + wordBreak + "\n\nWARNING: Binary input is too long for Morse input.  The following bits remain:\n\n" + binaryArray.join().replace(/,/g, "");
	} else if (!hasError && inputCharIndex < inputForMorseCode.length) {
		morseCodeOutput += wordBreak + wordBreak + wordBreak + "\n\nWARNING: Morse input is too long for Binary input by " + (inputForMorseCode.length - inputCharIndex) + " characters."
	}

	return morseCodeOutput.trim(" ");
}

var dictMorseCode = {
  "a": [1, 3],
  "b": [3, 1, 1, 1],
  "c": [3, 1, 3, 1],
  "d": [3, 1, 1],
  "e": [1],
  "f": [1, 1, 3, 1],
  "g": [3, 3, 1],
  "h": [1, 1, 1, 1],
  "i": [1, 1],
  "j": [1, 3, 3, 3],
  "k": [3, 1, 3],
  "l": [1, 3, 1, 1],
  "m": [3, 3],
  "n": [3, 1],
  "o": [3, 3, 3],
  "p": [1, 3, 3, 1],
  "q": [3, 3, 1, 3],
  "r": [1, 3, 1],
  "s": [1, 1, 1],
  "t": [3],
  "u": [1, 1, 3],
  "v": [1, 1, 1, 3],
  "w": [1, 3, 3],
  "x": [3, 1, 1, 3],
  "y": [3, 1, 3, 3],
  "z": [3, 3, 1, 1],
  "0": [3, 3, 3, 3, 3],
  "1": [1, 3, 3, 3, 3],
  "2": [1, 1, 3, 3, 3],
  "3": [1, 1, 1, 3, 3],
  "4": [1, 1, 1, 1, 3],
  "5": [1, 1, 1, 1, 1],
  "6": [3, 1, 1, 1, 1],
  "7": [3, 3, 1, 1, 1],
  "8": [3, 3, 3, 1, 1],
  "9": [3, 3, 3, 3, 1],
  ".": [1, 3, 1, 3, 1, 3],
  ",": [3, 3, 1, 1, 3, 3],
  ":": [3, 3, 3, 1, 1, 1],
  ";": [3, 3, 3, 1, 1, 1], // IMPROVISATION
  "?": [1, 1, 3, 3, 1, 1],
  "'": [1, 3, 3, 3, 3, 1],
  "-": [3, 1, 1, 1, 1, 3],
  "/": [3, 1, 1, 3, 1],
  "(": [3, 1, 3, 3, 1, 3],
  ")": [3, 1, 3, 3, 1, 3],
  '"': [1, 3, 1, 1, 3, 1],
  "=": [3, 1, 1, 1, 3],
  "[aa]": [1, 3, 1, 3], // New Line
  "[ar]": [1, 3, 1, 3, 1], // End of Message
  "[bt]": [3, 1, 1, 1, 3], // New Paragraph
  "[sk]": [1, 1, 1, 3, 1, 3], // End of Transmission
  "[va]": [1, 1, 1, 3, 1, 3], // End of Transmission
};

//http://www.unit-conversion.info/texttools/morse-code/#data

/*Morse Code notes:
 * Dot = 1
 * Dash = 3
 * Space between dot/dash = 1
 * Space between letters = 3
 * Space between words = 7
 */

// http://morsecode.scphillips.com/morse2.html

/*
51°31'25.5648"N, 000°09'30.7476"W
939, 30, 1; 166, 22, 3; 33°03'14.8896"S, 071°37'21.3564"W
196, 32, 6; 1032, 31, 14; 43°12'25.9092"N, 089°22'15.4020"W
910, 9, 2 - 8; 12, 7, 5; 43°12'25.9092"N, 089°22'15.4020"W
1, 1, 1; 879, 1, 2; 455, 39, 6; 42°08'31.4052"N, 072°32'02.0076"W
424, 34, 1; 42°14'24.2052"N, 074°08'38.9256"W
*/

/*
Dust of the sea, in you
the tongue receives a kiss
from ocean night:
taste imparts to every seasoned
dish your ocean essence;
the smallest,
miniature
wave from the saltcellar
reveals to us
more than domestic whiteness;
in it, we taste infinitude.

- from "Ode to Salt"
by Pablo Neruda

I'm glad we started kissing
*/