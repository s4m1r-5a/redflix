
module.exports = {
    /*database: {
        connectionLimit: 1000,
        host: '64.251.19.144',
        user: 'redflixx',
        password: 'colomb1@',
        database: 'redflix'
    },*/
    database: {
        connectionLimit: 1000,
        host: '213.190.6.64',
        user: 'u152781536_s',
        password: 'cinetflix',
        database: 'u152781536_redf'
    },
    /*database: {
        connectionLimit: 1000,
        host: 'localhost',
        user: 'redflixx',
        password: 'colomb1@',
        database: 'redflix'
    },*/
    registro: {
        pin: 'hola'
    },
    Google: {
        client_id: "358691758390-ea426ocipho2d13q7aku48q3gmo9ktal.apps.googleusercontent.com",
        project_id: "still-toolbox-253319",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "lIFar1pydYRrcArlKxTe3S8h",
        redirect_uris: [
            "https://redflixx.herokuapp.com/auth/google/callback",
            "http://localhost:3000/auth/google/callback"
        ],
        javascript_origins: [
            "https://redflixx.herokuapp.com",
            "http://localhost:3000"
        ]
    },
    Facebook: {
        client_id: '2450123638566580',
        client_secret: '458cba23923008c134dffcf01ad57e59',
        redirect_uris: [
            "https://redflixx.herokuapp.com/auth/facebook/callback",
            "http://localhost:3000/auth/facebook/callback"
        ]
    },
    Soat: {
        secret_id: 'qM6xM8mN7gW1jN8rE7tH6hC8sJ6qO1tU0tO3hY5wB6wK4hM2gD',
        client_id: '37eb1267-6c33-46b1-a76f-33a553fd812f',
        otro: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MTI4Mg.RO7HFV11U1YNtFNpPnCcOIaQcHU72f7tPn3HoOCMXOg'
    }
};




