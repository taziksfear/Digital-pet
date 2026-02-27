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

type PSt struct {
	Hng  float64 `json:"hng"`
	Eng  float64 `json:"eng"`
	Md   float64 `json:"md"`
	St   string  `json:"st"`
	Char string  `json:"char"`
	Nm   string  `json:"nm"`
	Cstm string  `json:"cstm"`
	Tut  int     `json:"tut"`
}

type ActReq struct {
	UId string `json:"uId"`
	Act string `json:"act"`
	PLd string `json:"pLd"`
}

var (
	db *sql.DB
	mu sync.Mutex
)

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./pets.db")
	if err != nil { log.Fatal(err) }

	q := `CREATE TABLE IF NOT EXISTS pts (
		uId TEXT PRIMARY KEY, hng REAL, eng REAL, md REAL, 
		st TEXT, char TEXT, nm TEXT, cstm TEXT, tut INTEGER
	);`
	_, err = db.Exec(q)
	if err != nil { log.Fatal(err) }
}

func getPetData(uId string) *PSt {
	p := &PSt{}
	r := db.QueryRow("SELECT hng, eng, md, st, char, nm, cstm, tut FROM pts WHERE uId = ?", uId)
	err := r.Scan(&p.Hng, &p.Eng, &p.Md, &p.St, &p.Char, &p.Nm, &p.Cstm, &p.Tut)
	
	if err == sql.ErrNoRows {
		p = &PSt{Hng: 50, Eng: 80, Md: 60, St: "brd", Char: "pig", Nm: "", Cstm: "none", Tut: 1}
		db.Exec("INSERT INTO pts (uId, hng, eng, md, st, char, nm, cstm, tut) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			uId, p.Hng, p.Eng, p.Md, p.St, p.Char, p.Nm, p.Cstm, p.Tut)
	}
	return p
}

func cors(n http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" { w.WriteHeader(200); return }
		n(w, r)
	}
}

func hGet(w http.ResponseWriter, r *http.Request) {
	uId := r.URL.Query().Get("uId")
	
	mu.Lock()
	p := getPetData(uId)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func hAct(w http.ResponseWriter, r *http.Request) {
	var rq ActReq
	json.NewDecoder(r.Body).Decode(&rq)
	
	mu.Lock()
	p := getPetData(rq.UId)
	
	switch rq.Act {
	case "fd": 
		p.Hng = min(100, p.Hng+25)
		p.Eng = max(0, p.Eng-5)
		p.St = "idle"
	case "pl": 
		p.Md = min(100, p.Md+30)
		p.Eng = max(0, p.Eng-15)
		p.St = "play"
	case "slp": 
		p.St = "slp"
	case "idle": 
		p.St = "idle"

    case "heal":
        p.Hng, p.Eng, p.Md = 100, 100, 100
        p.St = "idle"
    case "dev_minus_hng":
        p.Hng = max(0, p.Hng-20)
    case "dev_minus_eng":
        p.Eng = max(0, p.Eng-20)
    case "dev_minus_md":
        p.Md = max(0, p.Md-20)

	case "set_nm": p.Nm = rq.PLd
	case "set_char": p.Char = rq.PLd
	case "eq_snt": p.Cstm = "snt"
	case "eq_non": p.Cstm = "none"
	case "tut_dn": p.Tut = 0
	}
	
	db.Exec("UPDATE pts SET hng=?, eng=?, md=?, st=?, char=?, nm=?, cstm=?, tut=? WHERE uId=?",
		p.Hng, p.Eng, p.Md, p.St, p.Char, p.Nm, p.Cstm, p.Tut, rq.UId)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func wrk() {
	tk := time.NewTicker(1 * time.Second)
	for range tk.C {
		mu.Lock()
		
		type uData struct { id string; hng, eng, md float64; st string }
		var uds []uData
		
		r, err := db.Query("SELECT uId, hng, eng, md, st FROM pts")
		if err == nil {
			for r.Next() {
				var d uData
				r.Scan(&d.id, &d.hng, &d.eng, &d.md, &d.st)
				uds = append(uds, d)
			}
			r.Close()
		}
		
		for _, d := range uds {
			switch d.st {
			case "slp": d.eng = min(100, d.eng+0.1); d.hng = max(0, d.hng-0.5); d.md = max(0, d.md-1)
			case "play": d.md = min(100, d.md+2); d.eng = max(0, d.eng-2); d.hng = max(0, d.hng-1)
			case "idle", "brd": d.eng = max(0, d.eng-0.5); d.hng = max(0, d.hng-1); d.md = max(0, d.md-0.5)
			}
			db.Exec("UPDATE pts SET hng=?, eng=?, md=? WHERE uId=?", d.hng, d.eng, d.md, d.id)
		}
		mu.Unlock()
	}
}

func min(a, b float64) float64 { if a < b { return a }; return b }
func max(a, b float64) float64 { if a > b { return a }; return b }

func main() {
	initDB()
	go wrk()
	http.HandleFunc("/api/pet", cors(hGet))
	http.HandleFunc("/api/act", cors(hAct))
	log.Println("SQLite Бэкенд запущен: 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}