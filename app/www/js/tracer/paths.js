/**
 * SproutPlay - Tracer Path Data Module
 * SVG path data for numbers 0-9 and uppercase letters A-Z with stroke-order info.
 * Follows US preschool teaching conventions (top-to-bottom, left-to-right strokes).
 *
 * Each character entry:
 *   paths: Array of SVG path strings (one per stroke)
 *   strokeOrder: Numbered sequence showing stroke order (1, 2, 3...)
 *   boundingBox: { x, y, width, height } — spatial bounds (0-100 coordinate space)
 *   exampleWord: Optional word example for letters (e.g., "Apple" for "A")
 *   category: Optional word category for words (e.g., "animals", "colors")
 */

const Paths = (function () {

    // ── Coordinate System ────────────────────────────────────────
    // All paths use a 100×100 coordinate space. The tracer module
    // scales these dynamically to fit the Canvas element.

    var PATH_DATA = {

        // ═══════════════════════════════════════════════════════════
        // NUMBERS 0-9 (10 characters)
        // ═══════════════════════════════════════════════════════════

        "0": {
            paths: ["M 50 12 C 25 12, 15 40, 15 50 C 15 60, 25 88, 50 88 C 75 88, 85 60, 85 50 C 85 40, 75 12, 50 12"],
            strokeOrder: [1],
            boundingBox: { x: 15, y: 12, width: 70, height: 76 },
            exampleWord: null,
            category: null
        },

        "1": {
            paths: ["M 35 25 L 50 12 L 50 88"],
            strokeOrder: [1],
            boundingBox: { x: 30, y: 12, width: 25, height: 76 },
            exampleWord: null,
            category: null
        },

        "2": {
            paths: [
                "M 25 38 C 25 18, 40 12, 50 12 C 60 12, 75 18, 75 32 C 75 45, 60 58, 40 72 L 25 85 L 75 85"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 12, width: 60, height: 76 },
            exampleWord: null,
            category: null
        },

        "3": {
            paths: [
                "M 30 20 C 30 14, 42 12, 50 12 C 60 12, 75 18, 75 30 C 75 42, 60 48, 50 48 C 55 48, 75 52, 75 65 C 75 80, 60 88, 50 88 C 40 88, 28 84, 25 78"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 12, width: 60, height: 76 },
            exampleWord: null,
            category: null
        },

        "4": {
            paths: [
                "M 15 60 L 70 12 L 70 88",
                "M 15 55 L 70 55"
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 15, y: 12, width: 60, height: 76 },
            exampleWord: null,
            category: null
        },

        "5": {
            paths: [
                "M 70 12 L 30 12 L 28 45 C 35 42, 45 40, 50 40 C 65 40, 78 50, 78 65 C 78 80, 65 88, 50 88 C 38 88, 28 82, 22 75"
            ],
            strokeOrder: [1],
            boundingBox: { x: 18, y: 12, width: 62, height: 76 },
            exampleWord: null,
            category: null
        },

        "6": {
            paths: [
                "M 62 18 C 55 14, 45 12, 38 12 C 25 12, 15 22, 15 50 L 15 65 C 15 80, 28 88, 42 88 C 55 88, 65 80, 65 68 C 65 55, 55 48, 42 48 C 30 48, 20 55, 15 62"
            ],
            strokeOrder: [1],
            boundingBox: { x: 12, y: 12, width: 56, height: 76 },
            exampleWord: null,
            category: null
        },

        "7": {
            paths: [
                "M 25 12 L 75 12 L 45 88"
            ],
            strokeOrder: [1],
            boundingBox: { x: 22, y: 12, width: 56, height: 76 },
            exampleWord: null,
            category: null
        },

        "8": {
            paths: [
                "M 50 48 C 30 42, 22 32, 22 25 C 22 16, 35 12, 50 12 C 65 12, 78 16, 78 25 C 78 32, 70 42, 50 48 C 30 54, 22 64, 22 75 C 22 84, 35 88, 50 88 C 65 88, 78 84, 78 75 C 78 64, 70 54, 50 48"
            ],
            strokeOrder: [1],
            boundingBox: { x: 18, y: 12, width: 64, height: 76 },
            exampleWord: null,
            category: null
        },

        "9": {
            paths: [
                "M 50 15 C 30 15, 18 28, 18 42 C 18 56, 30 68, 50 68 C 68 68, 78 56, 78 42 C 78 28, 68 15, 50 15",
                "M 50 55 C 58 65, 62 78, 55 88"
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 15, y: 12, width: 68, height: 80 },
            exampleWord: null,
            category: null
        },

        // ═══════════════════════════════════════════════════════════
        // LETTERS A-Z (26 characters)
        // ═══════════════════════════════════════════════════════════

        "A": {
            paths: [
                "M 50 10 L 20 90",           // Left diagonal (stroke 1)
                "M 50 10 L 80 90",           // Right diagonal (stroke 2)
                "M 35 60 L 65 60"            // Crossbar (stroke 3)
            ],
            strokeOrder: [1, 2, 3],
            boundingBox: { x: 15, y: 10, width: 70, height: 85 },
            exampleWord: "Apple",
            category: "fruits"
        },

        "B": {
            paths: [
                "M 30 15 L 30 85",
                "M 30 15 C 70 10, 80 30, 80 32 C 80 45, 65 50, 30 50 C 70 50, 80 65, 80 68 C 80 80, 65 88, 30 85"
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 20, y: 15, width: 65, height: 75 },
            exampleWord: "Banana",
            category: "fruits"
        },

        "C": {
            paths: [
                "M 70 25 C 55 10, 25 20, 20 50 C 15 80, 45 95, 70 80"
            ],
            strokeOrder: [1],
            boundingBox: { x: 15, y: 15, width: 60, height: 75 },
            exampleWord: "Cat",
            category: "animals"
        },

        "D": {
            paths: [
                "M 30 15 L 30 85",
                "M 30 15 C 75 15, 85 50, 70 75 C 60 88, 40 88, 30 85"
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 20, y: 15, width: 65, height: 75 },
            exampleWord: "Dog",
            category: "animals"
        },

        "E": {
            paths: [
                "M 65 20 L 30 20 L 30 85 L 65 85",  // Main body (stroke 1)
                "M 30 52 L 50 52"                    // Middle bar (stroke 2)
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 25, y: 15, width: 45, height: 75 },
            exampleWord: "Elephant",
            category: "animals"
        },

        "F": {
            paths: [
                "M 65 20 L 30 20 L 30 85",         // Vertical + top (stroke 1)
                "M 30 52 L 50 52"                   // Middle bar (stroke 2)
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 25, y: 15, width: 45, height: 75 },
            exampleWord: "Fish",
            category: "animals"
        },

        "G": {
            paths: [
                "M 65 30 C 55 15, 25 20, 20 50 C 15 80, 45 95, 75 80 L 55 80 L 55 60"
            ],
            strokeOrder: [1],
            boundingBox: { x: 15, y: 15, width: 65, height: 75 },
            exampleWord: "Grape",
            category: "fruits"
        },

        "H": {
            paths: [
                "M 30 15 L 30 85",           // Left vertical (stroke 1)
                "M 70 15 L 70 85",           // Right vertical (stroke 2)
                "M 30 50 L 70 50"            // Crossbar (stroke 3)
            ],
            strokeOrder: [1, 2, 3],
            boundingBox: { x: 25, y: 15, width: 50, height: 75 },
            exampleWord: "House",
            category: "places"
        },

        "I": {
            paths: [
                "M 50 15 L 50 85"
            ],
            strokeOrder: [1],
            boundingBox: { x: 40, y: 15, width: 20, height: 75 },
            exampleWord: "Ice cream",
            category: "food"
        },

        "J": {
            paths: [
                "M 65 15 L 65 70 C 65 85, 35 90, 25 80"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 50, height: 75 },
            exampleWord: "Juice",
            category: "food"
        },

        "K": {
            paths: [
                "M 30 15 L 30 85",           // Vertical (stroke 1)
                "M 65 25 L 35 50 L 65 75"    // Diagonals (stroke 2)
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 25, y: 15, width: 45, height: 75 },
            exampleWord: "Kite",
            category: "toys"
        },

        "L": {
            paths: [
                "M 30 15 L 30 85 L 70 85"
            ],
            strokeOrder: [1],
            boundingBox: { x: 25, y: 15, width: 50, height: 75 },
            exampleWord: "Lamp",
            category: "furniture"
        },

        "M": {
            paths: [
                "M 25 85 L 25 15 L 50 45 L 75 15 L 75 85"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Monkey",
            category: "animals"
        },

        "N": {
            paths: [
                "M 25 85 L 25 15 L 75 85 L 75 15"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Nest",
            category: "nature"
        },

        "O": {
            paths: [
                "M 50 15 C 25 15, 15 35, 15 50 C 15 65, 25 88, 50 88 C 75 88, 85 65, 85 50 C 85 35, 75 15, 50 15"
            ],
            strokeOrder: [1],
            boundingBox: { x: 15, y: 15, width: 70, height: 80 },
            exampleWord: "Orange",
            category: "fruits"
        },

        "P": {
            paths: [
                "M 30 85 L 30 15 L 65 15 C 85 15, 85 45, 60 50 C 45 55, 30 55, 30 55"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 65, height: 75 },
            exampleWord: "Pig",
            category: "animals"
        },

        "Q": {
            paths: [
                "M 50 15 C 25 15, 15 35, 15 50 C 15 65, 25 88, 50 88 C 75 88, 85 65, 85 50 C 85 35, 75 15, 50 15",
                "M 60 65 L 80 88"
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 15, y: 15, width: 70, height: 80 },
            exampleWord: "Queen",
            category: "people"
        },

        "R": {
            paths: [
                "M 30 85 L 30 15 L 65 15 C 85 15, 85 45, 60 50 C 40 55, 30 55, 30 55",
                "M 30 50 L 70 85"
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Rose",
            category: "flowers"
        },

        "S": {
            paths: [
                "M 65 25 C 75 15, 45 12, 35 25 C 25 38, 45 50, 55 55 C 65 60, 80 68, 75 78 C 70 90, 45 92, 30 82"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Sun",
            category: "nature"
        },

        "T": {
            paths: [
                "M 25 20 L 75 20",           // Top bar (stroke 1)
                "M 50 20 L 50 85"            // Vertical (stroke 2)
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Tree",
            category: "nature"
        },

        "U": {
            paths: [
                "M 25 15 L 25 65 C 25 85, 75 85, 75 65 L 75 15"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Umbrella",
            category: "objects"
        },

        "V": {
            paths: [
                "M 25 15 L 50 85 L 75 15"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Volcano",
            category: "nature"
        },

        "W": {
            paths: [
                "M 15 15 L 30 85 L 50 50 L 70 85 L 85 15"
            ],
            strokeOrder: [1],
            boundingBox: { x: 10, y: 15, width: 80, height: 75 },
            exampleWord: "Whale",
            category: "animals"
        },

        "X": {
            paths: [
                "M 25 15 L 75 85",           // Diagonal 1 (stroke 1)
                "M 75 15 L 25 85"            // Diagonal 2 (stroke 2)
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Xylophone",
            category: "instruments"
        },

        "Y": {
            paths: [
                "M 25 15 L 50 50 L 75 15",   // V top (stroke 1)
                "M 50 50 L 50 85"            // Vertical (stroke 2)
            ],
            strokeOrder: [1, 2],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Yarn",
            category: "objects"
        },

        "Z": {
            paths: [
                "M 25 20 L 75 20 L 25 85 L 75 85"
            ],
            strokeOrder: [1],
            boundingBox: { x: 20, y: 15, width: 60, height: 75 },
            exampleWord: "Zebra",
            category: "animals"
        }

    }; // end PATH_DATA

    // ── Public API ────────────────────────────────────────────────

    /**
     * Get path data for a single character.
     * @param {string} character - Single char (e.g., "A", "5")
     * @returns {Object|null} Path data object or null if not found
     */
    function getPath(character) {
        var key = character.toUpperCase();
        return PATH_DATA[key] || null;
    }

    /**
     * Get all registered character keys.
     * @returns {string[]} Array of character strings (0-9, A-Z)
     */
    function getAllCharacters() {
        return Object.keys(PATH_DATA);
    }

    /**
     * Get all characters for a specific mode.
     * @param {string} mode - "numbers" or "letters"
     * @returns {string[]} Array of character strings for the mode
     */
    function getCharactersForMode(mode) {
        if (mode === "numbers") {
            return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
        }
        return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J",
               "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T",
               "U", "V", "W", "X", "Y", "Z"];
    }

    /**
     * Get word entries for Word Mode.
     * @returns {Array} Array of {word, letters, meaning, category} objects
     */
    function getWordEntries() {
        return [
            // 3-letter animals (Easy)
            { word: "CAT", letters: ["C", "A", "T"], meaning: "A furry animal that says meow! \uD83D\uDC31", category: "animals" },
            { word: "DOG", letters: ["D", "O", "G"], meaning: "A loyal pet that wags its tail! \uD83D\uDC36", category: "animals" },
            { word: "PIG", letters: ["P", "I", "G"], meaning: "A pink farm animal that loves mud! \uD83D\uDC37", category: "animals" },
            { word: "BEE", letters: ["B", "E", "E"], meaning: "A tiny insect that makes honey! \uD83D\uDC1D", category: "animals" },
            { word: "FROG", letters: ["F", "R", "O", "G"], meaning: "A green jumper that says ribbit! \uD83D\uDC38", category: "animals" },
            { word: "FISH", letters: ["F", "I", "S", "H"], meaning: "A swimmer that lives in water! \uD83D\uDC1F", category: "animals" },
            { word: "MOUSE", letters: ["M", "O", "U", "S", "E"], meaning: "A tiny squeaker that loves cheese! \uD83D\uDC01", category: "animals" },
            { word: "MONKEY", letters: ["M", "O", "N", "K", "E", "Y"], meaning: "A swinging jungle animal! \uD83D\uDC35", category: "animals" },

            // 3-letter colors (Easy)
            { word: "RED", letters: ["R", "E", "D"], meaning: "The color of apples and strawberries! \uD83C\uDF4E", category: "colors" },
            { word: "BLUE", letters: ["B", "L", "U", "E"], meaning: "The color of the sky and ocean! \uD83D\uDD35", category: "colors" },
            { word: "GREEN", letters: ["G", "R", "E", "E", "N"], meaning: "The color of grass and frogs! \uD83C\uDF3F", category: "colors" },
            { word: "PINK", letters: ["P", "I", "N", "K"], meaning: "The color of flamingos and cotton candy! \uD83E\uDDDF", category: "colors" },
            { word: "ORANGE", letters: ["O", "R", "A", "N", "G", "E"], meaning: "The color of pumpkins and oranges! \uD83C\uDF4A", category: "colors" },

            // 3-letter food (Easy)
            { word: "PIZZA", letters: ["P", "I", "Z", "Z", "A"], meaning: "A cheesy favorite food! \uD83C\uDF55", category: "food" },
            { word: "CAKE", letters: ["C", "A", "K", "E"], meaning: "A sweet treat for birthdays! \uD83C\uDF70", category: "food" },
            { word: "MILK", letters: ["M", "I", "L", "K"], meaning: "A white drink from cows! \uD83E\uDD5B", category: "food" },
            { word: "JUICE", letters: ["J", "U", "I", "C", "E"], meaning: "A fruity drink in a cup! \uD83E\uDD64", category: "food" },

            // 3-letter nature (Easy)
            { word: "SUN", letters: ["S", "U", "N"], meaning: "A bright star that warms the Earth! \u2600\uFE0F", category: "nature" },
            { word: "SKY", letters: ["S", "K", "Y"], meaning: "The big blue space above us! \uD83C\uDF04", category: "nature" },
            { word: "TREE", letters: ["T", "R", "E", "E"], meaning: "A tall plant with leaves and branches! \uD83C\uDF33", category: "nature" },
            { word: "STAR", letters: ["S", "T", "A", "R"], meaning: "A twinkling light in the night sky! \u2B50", category: "nature" },
            { word: "RAIN", letters: ["R", "A", "I", "N"], meaning: "Water drops falling from clouds! \uD83C\uDF27\uFE0F", category: "nature" },

            // 4-letter objects (Medium)
            { word: "BOOK", letters: ["B", "O", "O", "K"], meaning: "A stack of pages with stories! \uD83D\uDCD6", category: "objects" },
            { word: "CUP", letters: ["C", "U", "P"], meaning: "A container for drinking! \uD83E\uDDC4", category: "objects" },
            { word: "LAMP", letters: ["L", "A", "M", "P"], meaning: "A bright light for your room! \uD83D\uDCA1", category: "objects" },
            { word: "TOY", letters: ["T", "O", "Y"], meaning: "Something fun to play with! \uD83E\uDDF8", category: "objects" },
            { word: "BELL", letters: ["B", "E", "L", "L"], meaning: "A shiny thing that goes ding-ding! \uD83D\uDD14", category: "objects" },

            // 4-5 letter places (Medium)
            { word: "HOUSE", letters: ["H", "O", "U", "S", "E"], meaning: "A place where people live! \uD83C\uDFE0", category: "places" },
            { word: "SCHOOL", letters: ["S", "C", "H", "O", "O", "L"], meaning: "A place to learn and play! \uD83C\uDFEB", category: "places" },

            // 4-5 letter toys (Medium)
            { word: "KITE", letters: ["K", "I", "T", "E"], meaning: "A flying toy on a string! \uD83E�A", category: "toys" },
            { word: "BALL", letters: ["B", "A", "L", "L"], meaning: "A round toy you can bounce! \u26BD", category: "toys" },
            { word: "DOLL", letters: ["D", "O", "L", "L"], meaning: "A toy friend you can hug! \uD83E\uDDF8", category: "toys" },

            // 4-6 letter flowers (Medium)
            { word: "ROSE", letters: ["R", "O", "S", "E"], meaning: "A pretty flower with petals! \uD83C\uDF39", category: "flowers" },
            { word: "LILY", letters: ["L", "I", "L", "Y"], meaning: "A delicate flower by the pond! \uD83C\uDF3C", category: "flowers" },

            // 4-6 letter instruments (Medium)
            { word: "DRUM", letters: ["D", "R", "U", "M"], meaning: "A musical thing you beat! \uD83E\uDD41", category: "instruments" },
            { word: "PIANO", letters: ["P", "I", "A", "N", "O"], meaning: "A musical instrument with black and white keys! \uD83C\uDFB9", category: "instruments" },
            { word: "XYLOPHONE", letters: ["X", "Y", "L", "O", "P", "H", "O", "N", "E"], meaning: "A rainbow instrument you tap! \uD83C\uDFB5", category: "instruments" }
        ];
    }

    /**
     * Get a word entry by its word string.
     * @param {string} word - Word string (e.g., "CAT")
     * @returns {Object|null} Word entry or null if not found
     */
    function getWordEntry(word) {
        var entries = getWordEntries();
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].word === word.toUpperCase()) {
                return entries[i];
            }
        }
        return null;
    }

    /**
     * Get all word entries filtered by category.
     * @param {string} category - Category string (e.g., "animals")
     * @returns {Array} Filtered word entries
     */
    function getWordsByCategory(category) {
        var entries = getWordEntries();
        return entries.filter(function (w) { return w.category === category; });
    }

    // Public API
    return {
        getPath: getPath,
        getAllCharacters: getAllCharacters,
        getCharactersForMode: getCharactersForMode,
        getWordEntries: getWordEntries,
        getWordEntry: getWordEntry,
        getWordsByCategory: getWordsByCategory
    };

})();
