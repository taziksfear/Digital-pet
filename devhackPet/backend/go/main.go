package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type PSt struct {
	Hng      float64 `json:"hng"`
	Eng      float64 `json:"eng"`
	Md       float64 `json:"md"`
	Tl       float64 `json:"tl"`      
	Balance  int     `json:"balance"` 
	St       string  `json:"st"`
	Char     string  `json:"char"`
	Nm       string  `json:"nm"`
	Cstm     string  `json:"cstm"`
	Tut      int     `json:"tut"`
	Unlocked string  `json:"unlocked"`
	Wth      string  `json:"wth"`      // погода: clr, rn, snw
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
	if err != nil {
		log.Fatal(err)
	}

	q := `CREATE TABLE IF NOT EXISTS pts (
		uId TEXT PRIMARY KEY, 
		hng REAL, eng REAL, md REAL, tl REAL, balance INTEGER,
		st TEXT, char TEXT, nm TEXT, cstm TEXT, tut INTEGER,
		unlocked TEXT, wth TEXT
	);`
	_, err = db.Exec(q)
	if err != nil {
		log.Fatal(err)
	}
}

func getPetData(uId string) *PSt {
	p := &PSt{}
	r := db.QueryRow("SELECT hng, eng, md, tl, balance, st, char, nm, cstm, tut, unlocked, wth FROM pts WHERE uId = ?", uId)
	err := r.Scan(&p.Hng, &p.Eng, &p.Md, &p.Tl, &p.Balance, &p.St, &p.Char, &p.Nm, &p.Cstm, &p.Tut, &p.Unlocked, &p.Wth)

	if err == sql.ErrNoRows {
		p = &PSt{
			Hng:      50,
			Eng:      80,
			Md:       60,
			Tl:       50,
			Balance:  1000,
			St:       "brd",
			Char:     "twilight",
			Nm:       "",
			Cstm:     "none",
			Tut:      1,
			Unlocked: `["twilight"]`,
			Wth:      "clr",
		}
		db.Exec("INSERT INTO pts (uId, hng, eng, md, tl, balance, st, char, nm, cstm, tut, unlocked, wth) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			uId, p.Hng, p.Eng, p.Md, p.Tl, p.Balance, p.St, p.Char, p.Nm, p.Cstm, p.Tut, p.Unlocked, p.Wth)
	}
	return p
}

func cors(n http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(200)
			return
		}
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
		// Увеличиваем сытость на 20% (не больше 100)
		p.Hng = min(100, p.Hng+20)
		p.Eng = max(0, p.Eng-5)
		p.St = "idle"
	case "pl":
		// Увеличиваем настроение на 20% (не больше 100)
		p.Md = min(100, p.Md+20)
		p.Eng = max(0, p.Eng-15)
		p.St = "play"
	case "slp":
		p.St = "slp"
	case "idle":
		p.St = "idle"
	case "heal":
		p.Hng, p.Eng, p.Md, p.Tl = 100, 100, 100, 100 
		p.St = "idle"
	case "dev_minus_hng":
		p.Hng = max(0, p.Hng-20)
	case "dev_minus_eng":
		p.Eng = max(0, p.Eng-20)
	case "dev_minus_md":
		p.Md = max(0, p.Md-20)
	case "dev_minus_tl":
		p.Tl = max(0, p.Tl-20)
	case "toilet_start":
		p.St = "toilet"
	case "toilet_update":
		var newTl float64
		if _, err := fmt.Sscanf(rq.PLd, "%f", &newTl); err == nil {
			p.Tl = min(100, newTl)
		}
	case "balance_add":
		var add int
		if _, err := fmt.Sscanf(rq.PLd, "%d", &add); err == nil {
			p.Balance += add
		}
	case "unlock_char":
		p.Unlocked = rq.PLd
	case "set_nm":
		p.Nm = rq.PLd
	case "set_char":
		p.Char = rq.PLd
	case "eq_snt":
		p.Cstm = "snt"
	case "eq_non":
		p.Cstm = "none"
	case "tut_dn":
		p.Tut = 0
	case "set_wth":
		p.Wth = rq.PLd
	}

	db.Exec("UPDATE pts SET hng=?, eng=?, md=?, tl=?, balance=?, st=?, char=?, nm=?, cstm=?, tut=?, unlocked=?, wth=? WHERE uId=?",
		p.Hng, p.Eng, p.Md, p.Tl, p.Balance, p.St, p.Char, p.Nm, p.Cstm, p.Tut, p.Unlocked, p.Wth, rq.UId)
	mu.Unlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

// Воркер обновления статистики (каждую секунду)
func wrk() {
	tk := time.NewTicker(1 * time.Second)
	for range tk.C {
		mu.Lock()

		type uData struct {
			id            string
			hng, eng, md, tl float64
			st, wth       string
		}
		var uds []uData

		r, err := db.Query("SELECT uId, hng, eng, md, tl, st, wth FROM pts")
		if err == nil {
			for r.Next() {
				var d uData
				r.Scan(&d.id, &d.hng, &d.eng, &d.md, &d.tl, &d.st, &d.wth)
				uds = append(uds, d)
			}
			r.Close()
		}

		for _, d := range uds {
			// Изменения в зависимости от состояния
			switch d.st {
			case "slp":
				d.eng = min(100, d.eng+0.1)
				d.hng = max(0, d.hng-0.2)  // медленное снижение голода
				d.md  = max(0, d.md-0.2)   // медленное снижение настроения
			case "play":
				d.md = min(100, d.md+2)    // игра поднимает настроение
				d.eng = max(0, d.eng-2)
				d.hng = max(0, d.hng-0.2)  // медленное снижение голода
			case "idle", "brd":
				// Все параметры медленно уменьшаются с одинаковой скоростью
				d.hng = max(0, d.hng-0.2)
				d.eng = max(0, d.eng-0.2)
				d.md  = max(0, d.md-0.2)
			}

			// Уменьшение потребности в туалете (кроме состояния "toilet")
			if d.st != "toilet" {
				d.tl = max(0, d.tl-0.2)
			}

			// Влияние погоды на настроение (md)
			switch d.wth {
			case "rn": // дождь – настроение падает быстрее (дополнительно -0.25)
				d.md = max(0, d.md-0.25)
			case "snw": // снег – небольшое влияние
				d.md = max(0, d.md-0.1)
			// case "clr": без изменений
			}

			db.Exec("UPDATE pts SET hng=?, eng=?, md=?, tl=? WHERE uId=?", d.hng, d.eng, d.md, d.tl, d.id)
		}
		mu.Unlock()
	}
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}

func max(a, b float64) float64 {
	if a > b {
		return a
	}
	return b
}

func main() {
	initDB()
	go wrk()

	http.HandleFunc("/api/pet", cors(hGet))
	http.HandleFunc("/api/act", cors(hAct))

	log.Println("SQLite Бэкенд запущен на порту 8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}