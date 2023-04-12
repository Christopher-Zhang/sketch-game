## FLOW
client = {id, username?, user_id, game_id}

client sends message:
- {message: string}
- recieve message
- game logic
  - if in correct state
  - conditionally propagate to the other players


how to manage?
- all backend
  - manage each player's state
    - guesser, drawer
    - score
    - throttling?
  - manage game state
    - timer
    - state of the game (picking, drawing)
    - votekick?
  - 