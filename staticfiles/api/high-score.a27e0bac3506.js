function getCsrfToken() {
    return fetch('/api/csrf_token/')
      .then(response => response.json())
      .then(data => data.csrfToken)
      .catch(error => {
        console.log('Error:', error);
        return null;
      });
}

function getGameSlugFromUrl() {
    const urlParts = window.location.pathname.split('/');
    const gameSlug = urlParts[urlParts.length - 2];
  
    return gameSlug
}

function get_high_scores(num, callback) {
    fetch(`http://127.0.0.1:8000/api/get-high-scores/${getGameSlugFromUrl()}/${num}`, {
        method: 'GET',
    }).then(response => response.json())
    .then(data => {
        callback(data)
    }).catch(error => {
        console.log('Error: ', error)
    })
}

function get_info(callback) {
    getCsrfToken().then(csrfToken => {
        if (csrfToken) {
            fetch('http://127.0.0.1:8000/api/get-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    game_slug: getGameSlugFromUrl(),
                }),
            }).then(response => response.json())
            .then(data => {
                callback(data)
            }).catch(error => {
                console.log('Error: ', error)
            })
        }
    })
}

function add_score(playerScore, callback) {
    getCsrfToken().then(csrfToken => {
        if (csrfToken) {
            fetch('http://127.0.0.1:8000/api/add-score', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                },
                body: JSON.stringify({
                    game_slug: getGameSlugFromUrl(),
                    score: playerScore,
                }),
            }).then(response => response.json())
            .then(data => {
                if (!data.error) {
                    if (data.redirect_url) {
                        window.location.href = data.redirect_url
                    }
                    callback(data)
                } else {
                    console.error(`${data.error}: ${data.error_message}`)
                }
            }).catch(error => {
                console.error('Error: ', error)
            })
        }
    })
}


