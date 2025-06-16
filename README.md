# 🎮 Edge Games

**Edge Games** is a full-stack browser game platform where:
- 🎮 Users can play HTML/JavaScript games directly in their browser.
- 🧑‍💻 Developers can upload their own games with full static asset support.
- 🧠 A custom high-score API tracks user and global records in real-time.

Built with **Django** and **SQLite**, Edge Games handles file uploads, routing, session management, and JavaScript-based API integrations.

---

## 🌐 Live Demo

🔗 [https://edgegames.pythonanywhere.com](https://edgegames.pythonanywhere.com)

---

## 🚀 Features

### 👥 For Users
- Browse and play uploaded games instantly.
- No installation or downloads — all games run in-browser.
- Play as a guest or sign up to save high scores.
- Scores posted while playing as a guest are automatically linked when the user signs up.

---

### 👨‍🔧 For Developers
- Upload your game folder (HTML + assets).
- Django automatically serves all static files from structured URLs.
- Full support for:
  - `.html`, `.css`, `.js`
  - Image files (`.png`, `.jpg`, etc.)
  - Audio (`.mp3`)
  - Fonts and other assets

### 📁 Static Asset Routing Example

If a game is uploaded as `space-shooter`, then:
- Game page → `/space-shooter/play/`
- Static file → `/files/space-shooter/main.css`

---

## 🧠 High Score API

### 🔹 `add_score(score, callback)`
JS-callable function to submit a user’s score.

- Detects:
  - New **personal best**
  - New **global high score**
- Returns structured response for in-game feedback.

**Example usage in game JavaScript:**
```javascript
add_score(score, callback_func);
````

**Example response:**

```json
{
    "is_highest_score": false,
    "is_players_highest_score": false,
    "players_score": 17.0,
    "is_authenticated": true
}
```

---

### 🔹 `get_info(callback)`
Returns the information regarding the user for devoloper to display personalized messages in game

**Example usage in game JavaScript:**
```javascript
get_info(score, callback_func);
````

**Example response:**

```json
{
    "is_authenticated": true,
    "username": "MuhammadK",
    "highest_score": 28
}
```

---

### 🔹 `getTopScores(gameId)`

Returns the top high scores for a specific game.

**Example usage:**

```javascript
get_high_scores(num, callback)
```

**Returns:**

```json
{
    "high_scores": [
        {"rank": 1, "score": 55, "user": "ShuriBear"},
        {"rank": 2, "score": 28, "user": "MuhammadK"},
        {"rank": 3, "score": 22, "user": "climb"},
    ]
}
```

---

## 🍪 Guest Score Tracking

* Guests can play and submit scores without logging in.
* Scores are linked to the device using browser cookies.
* When a guest later signs up or logs in, their scores are auto-linked to the account.

---

## 🛡 Known Dev-Mode Vulnerability

> ❗ Scores can currently be submitted via browser console by calling the JS function manually.
> This was left open for development/testing flexibility.
> ⚠️ In production, this should be protected via CSRF validation or backend verification.

---

## 🧱 Tech Stack

* **Backend**: Django (Python)
* **Frontend**: HTML, CSS, JavaScript, Tailwind
* **Database**: SQLite
* **Static File Handling**: Django’s staticfiles system
* **Hosting**: PythonAnywhere

---

## 💡 Why I Built This

There aren't many beginner-friendly, developer-open platforms where people can host simple HTML games with scoring APIs. Edge Games was my way to:

* Build a complete file-serving backend with static file logic
* Design and implement developer-facing APIs
* Handle guest-user session logic with cookies
* Provide players with a fun and competitive browser gaming experience

---

## 🧑‍💻 Author

**Muhammad Kamkoriwala**
📧 [kamkoriwalamuhammad@gmail.com](mailto:kamkoriwalamuhammad@gmail.com)
🔗 GitHub: [github.com/Dragoon812003](https://github.com/Dragoon812003)

---
