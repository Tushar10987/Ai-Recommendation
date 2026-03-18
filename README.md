# AI Product Recommendation System

A full-stack web application that provides product recommendations based on user preferences. The system combines AI-based recommendations with a rule-based fallback to ensure reliability.

---

## Features

* User input-based product search (e.g., "phone under 500")
* AI-powered recommendation system (OpenAI integration)
* Rule-based fallback system (works without API)
* Dynamic product listing
* Filtering based on category and price
* React-based frontend
* REST API backend using Node.js and Express

---

## Tech Stack

### Frontend

* React.js
* Axios

### Backend

* Node.js
* Express.js
* OpenAI API (optional)
* dotenv

---

## Project Structure

```
ai-recommendation/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── src/
│   ├── App.js
│   ├── products.js
│   └── index.js
│
├── package.json
└── README.md
```

---

## Installation and Setup

### Clone the Repository

```
git clone https://github.com/your-username/ai-recommendation.git
cd ai-recommendation
```

---

### Install Frontend Dependencies

```
npm install
```

---

### Setup Backend

```
cd backend
npm install
```

---

### Environment Variables (Optional for AI)

Create a `.env` file inside the backend folder:

```
OPENAI_API_KEY=your_api_key_here
```

---

## Running the Application

### Start Backend

```
cd backend
node server.js
```

---

### Start Frontend

Open a new terminal:

```
npm start
```

---

### Access the App

```
http://localhost:3000
```

---

## Example Inputs

* I want a phone under 500
* laptop under 800
* cheap phone

---

## How It Works

1. User enters a preference query
2. Frontend sends request to backend API
3. Backend:

   * Attempts AI-based recommendation (if available)
   * Falls back to rule-based filtering if AI fails
4. Results are returned and displayed

---

## Error Handling

* Handles API failures gracefully
* Uses fallback logic when AI is unavailable
* Prevents application crashes

---

## Future Improvements

* Improved UI design
* Recommendation scoring
* Better query understanding
* User authentication
* Mobile responsiveness

---

## License

This project is open-source and available under the MIT License.

---

## Author

Tushar
