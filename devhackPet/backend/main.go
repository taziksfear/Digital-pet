package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type PetState struct {
	Hunger    float64 `json:"hunger"`
	Energy    float64 `json:"energy"`
	Mood      float64 `json:"mood"`
	State     string  `json:"state"`     // idle, play, slp, brd
	Character string  `json:"character"` // pig, fluffy, eye
	Name      string  `json:"name"`
	Costume   string  `json:"costume"`
	Tutorial  int     `json:"tutorial"`  // 0 = пройден
}

type ActionRequest struct {
	UserID  string `json:"userId"`
	Action  string `json:"action"`
	Payload string `json:"payload"`
}

var (
	db *sql.DB
	mu sync.Mutex
)

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./pets.db")
	if err != nil { log.Fatal(err) }

	q := `CREATE TABLE IF NOT EXISTS pets (
		userId TEXT PRIMARY KEY, hunger REAL, energy REAL, mood REAL, 
		state TEXT, character TEXT, name TEXT, costume TEXT, tutorial INTEGER
	);`
	_, err = db.Exec(q)
	if err != nil { log.Fatal(err) }
}

func getPetData(userId string) *PetState {
	p := &PetState{}
	r := db.QueryRow("SELECT hunger, energy, mood, state, character, name, costume, tutorial FROM pets WHERE userId = ?", userId)
	err := r.Scan(&p.Hunger, &p.Energy, &p.Mood, &p.State, &p.Character, &p.Name, &p.Costume, &p.Tutorial)
	
	if err == sql.ErrNoRows {
		p = &PetState{Hunger: 50, Energy: 80, Mood: 60, State: "bored", Character: "pig", Name: "", Costume: "none", Tutorial: 1}
		db.Exec("INSERT INTO pets (userId, hunger, energy, mood, state, character, name, costume, tutorial) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			userId, p.Hunger, p.Energy, p.Mood, p.State, p.Character, p.Name, p.Costume, p.Tutorial)
	}
	return p
}

func cors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" { w.WriteHeader(200); return }
		next(w, r)
	}
}

func handleGet(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	
	mu.Lock()
	p := getPetData(userId)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func handleAction(w http.ResponseWriter, r *http.Request) {
	var req ActionRequest
	json.NewDecoder(r.Body).Decode(&req)
	
	mu.Lock()
	p := getPetData(req.UserID)
	
	switch req.Action {
	case "feed": 
		p.Hunger = min(100, p.Hunger+25)
		p.Energy = max(0, p.Energy-0.5)
		p.State = "idle"
	case "play": 
		p.Mood = min(100, p.Mood+30)
		p.Energy = max(0, p.Energy-1.5)
		p.State = "play"
	case "sleep": 
		p.Energy = min(100, p.Energy+10)
		p.Hunger = max(0, p.Hunger-0.5)
		p.State = "sleep"
	case "idle": 
		p.State = "idle"
	case "set_name": p.Name = req.Payload
	case "set_char": p.Character = req.Payload
	case "equip_santa": p.Costume = "santa"
	case "equip_none": p.Costume = "none"
	case "tut_done": p.Tutorial = 0
	}
	
	db.Exec("UPDATE pets SET hunger=?, energy=?, mood=?, state=?, character=?, name=?, costume=?, tutorial=? WHERE userId=?",
		p.Hunger, p.Energy, p.Mood, p.State, p.Character, p.Name, p.Costume, p.Tutorial, req.UserID)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func worker() {
	ticker := time.NewTicker(1 * time.Second)
	for range ticker.C {
		mu.Lock()
		
		type userData struct { id string; hunger, energy, mood float64; state string }
		var users []userData
		
		rows, err := db.Query("SELECT userId, hunger, energy, mood, state FROM pets")
		if err == nil {
			for rows.Next() {
				var u userData
				rows.Scan(&u.id, &u.hunger, &u.energy, &u.mood, &u.state)
				users = append(users, u)
			}
			rows.Close()
		}
		
		for _, u := range users {
			switch u.state {
			case "sleep": u.energy = min(100, u.energy+4); u.hunger = max(0, u.hunger-0.1)
			case "play": u.mood = min(100, u.mood+2); u.energy = max(0, u.energy-1.5); u.hunger = max(0, u.hunger-0.3)
			case "idle", "bored": u.energy = max(0, u.energy-0.3); u.hunger = max(0, u.hunger-0.5); u.mood = max(0, u.mood-0.4)
			}
			db.Exec("UPDATE pets SET hunger=?, energy=?, mood=? WHERE userId=?", u.hunger, u.energy, u.mood, u.id)
		}
		mu.Unlock()
	}
}

func min(a, b float64) float64 { if a < b { return a }; return b }
func max(a, b float64) float64 { if a > b { return a }; return b }

func main() {
	initDB()
	go worker()
	http.HandleFunc("/api/pet", cors(handleGet))
	http.HandleFunc("/api/act", cors(handleAction))
	fs := http.FileServer(http.Dir("../frontend/dist"))
	http.Handle("/", fs)
	log.Println("Backend started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}