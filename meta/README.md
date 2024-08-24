# Adaptive Anarchy
***Users of r/AnarchyChess (or anyone) can train this chess bot based on what they decide is a good move.***

---
### How to train the bot

By default, the 'train' checkbox is toggled on. This means that you are ready to train the bot. At any time in your game, you can toggle this off, and the game will let you just play, without helping train.

Assuming the checkbox is checked, the game will present you with options ranging from 'brilliant' to 'blunder' after each of the bot's moves. You must rate the bot's move before being allowed to play. This will be saved.

---
### How does it work?

Every time the bot makes its move, it checks a database for probabilities, and makes its move based on what is most favoured. Your ratings will affect the most and least favoured moves for each board position.

To be more technical, it looks at a list corresponding to the current board position, which is full of all of the legal moves. For instance, it might have a list like this:

`['e5', 'e5', 'e5', 'e6', 'e6', 'Nf6', 'Na6', 'Na6', ...]`

Note that some moves are there several times. The bot will choose a random move from this list. The ones that appear more times than others are more likely to be picked.

---
### Notes

Moves that are ambiguous can be incorrectly considered legal or illegal. For instance, if two knights are aiming at the same spot, and you try to move one, the move will be considered ambiguous because I haven't perfect the system that converts moves into algebraic notation. The game will not allow you to make that move.

Similarly, if you try to move your starting pawn (for example) to a different column, the algebraic notation will not mention the starting position, and will be ambgiguous, so the game will move the more logical pawn instead of the one you moved.

***I am working on fixing this.***