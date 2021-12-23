import './App.css';
import { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

/*********************** 0.MAIN ************************/

const App = () => {

  const [showdrop, setShowdrop] = useState(false); // 1.Flow control
  const [showend, setShowend] = useState(false);
  const [found, setFound] = useState([false, false, false]);
  const [answer, setAnswer] = useState([]);

  const [startTimer, setStartTimer] = useState(false); // 2.Timer
  const [numtime, setNumtime] = useState(0);

  const [curx, setCurx] = useState(0); // 3.Click position
  const [cury, setCury] = useState(0);

  const [app, setApp] = useState(""); // 4.Database
  const [db, setDb] = useState("");
  const [mlist, setMlist] = useState([]);

  useEffect(() => { // Initialize character location from database

    /*    setAnswer(
          [
            {
              id: 0,
              name: "Violet Minion",
              left: 834,
              top: 87,
              right: 872,
              bottom: 100,
            },
            {
              id: 1,
              name: "Train Cat",
              left: 62,
              top: 766,
              right: 194,
              bottom: 783,
            },
            {
              id: 2,
              name: "Pig Baby",
              left: 840,
              top: 731,
              right: 887,
              bottom: 745,
            }
          ]);
    */
    const firebaseConfig = {
      apiKey: "AIzaSyB5o7ElLAYC1IsbwpQzLCiiaWraEj6eSv8",
      authDomain: "waldo-74313.firebaseapp.com",
      projectId: "waldo-74313",
      storageBucket: "waldo-74313.appspot.com",
      messagingSenderId: "668579718686",
      appId: "1:668579718686:web:2600c45e1caf90afdd300f",
      measurementId: "G-ZHTFC6D3WM"
    };

    const apps = initializeApp(firebaseConfig);
    const dbs = getFirestore();


    setApp(apps);
    setDb(dbs);

    readTable(dbs);
    readChar(dbs);


  }, []);


  //---------------- Database related ------------------------//

  const saveName = (myObj) => {

    const tmpArr = [...mlist];

    tmpArr.push(myObj);

    tmpArr.sort((a, b) => {
      return a.time - b.time;
    });


    if (tmpArr.length > 10) tmpArr.length = 10; // remove anything more than 10


    saveFirestore(db, "main", "toplist", tmpArr);


    setMlist(tmpArr);

  };

  const saveFirestore = async (dbObj, collectionName, docName, dataArray) => {

    const dataObj = dataArray.reduce(
      (obj, item) => ({
        ...obj, [item['date']]: item
      }), {});

    try {
      await setDoc(doc(dbObj, collectionName, docName), dataObj);
    }
    catch (error) {
      console.error('Error writing new message to Firebase Database', error);
    }
  }


  const readChar = async (dbs) => {

    const myObj = await readFirestore(dbs, "main", "charlist");

    const myArr = Object.values(myObj);
    myArr.sort((a, b) => {
      return a.id - b.id;
    });

    setAnswer(myArr);

  };


  const readTable = async (dbs) => {

    const myObj = await readFirestore(dbs, "main", "toplist");

    const myArr = Object.values(myObj);
    myArr.sort((a, b) => {
      return a.time - b.time;
    });

    setMlist(myArr);

  };

  const readFirestore = async (dbObj, collectionName, docName) => {

    const docRef = doc(dbObj, collectionName, docName);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

      // console.log("Document data:", docSnap.data());
      return docSnap.data();

    } else {
      // doc.data() = undefined
      console.log("No such document!");
      return null;
    }
  };

  //---------------- Timer related ------------------------//

  const endCount = (stime) => {

    setNumtime(stime);

  };

  const startCount = () => {

    setStartTimer(true);
  };


  // ----------------------- Normal program ---------------------//

  const verifyChar = (n) => {

    const mw = document.querySelector(".mbody").clientWidth;
    const mh = document.querySelector(".mbody").clientHeight;

    const ax = Math.floor((curx / mw) * 1000); // Scale position to screen size
    const ay = Math.floor((cury / mh) * 1000);

    //console.log("-------------------------------------------");
    //console.log(`(${ax},${ay})`);
    //console.log(`x : ${answer[0].left} - ${answer[0].right}`);
    //console.log(`y : ${answer[0].top} - ${answer[0].bottom}`);

    if ((ax >= answer[n].left) &&
      (ax <= answer[n].right) &&
      (ay >= answer[n].top) &&
      (ay <= answer[n].bottom)) { // 1. Just discover new char !

      if (!found[n]) {  // 1.1 1st time found yet, return number

        let tmpArray = [...found];
        tmpArray[n] = true;
        setFound(tmpArray);
        console.log(tmpArray);

        if (tmpArray[0] && tmpArray[1] && tmpArray[2]) {
          console.log(`You found everyone. Good job !`);
          setShowend(true);
          setStartTimer(false);

        } else {
          console.log(`You found ${answer[n].name}.`);
        }

      } else { // 1.2 Already found ! 

        console.log(`You have already found ${answer[n].name}.`);
      }
    } else { // 2. Found nothing

      console.log(`This is not ${answer[n].name}.`);
    }
  };

  const clickImg = (e) => {

    setCurx(e.pageX);
    setCury(e.pageY);
    setShowdrop(!showdrop); // Set state to show dropdown menu & get (n)
  };

  return (
    <div className="App">
      <WelcomeModal ret={startCount} />
      <EndContainer show={showend} numtime={numtime} mlist={mlist} saveName={saveName} />
      <div className="mheader">
        <div className="mheader-left">
          <div>
            <img className="imgborder" src="./pic/Violet Minion.png" alt="Violet Minion" />
            <p>Violet Minion</p>
            <Crossout show={found[0]} />
          </div>
          <div>
            <img className="imgborder" src="./pic/Yellow Cat.png" alt="Train Cat" />
            <p>Train Cat</p>
            <Crossout show={found[1]} />
          </div>
          <div>
            <img className="imgborder" src="./pic/Pig Baby.png" alt="Pig Baby" />
            <p>Pig Baby</p>
            <Crossout show={found[2]} />
          </div>
        </div>
        <div className="mheader-middle">
          <h1><i>Where are we ?</i></h1>
        </div>
        <TimeContainer start={startTimer} ret={endCount} />
      </div>
      <div className="mbody" onClick={e => { clickImg(e) }}>
        <DropMenu show={showdrop} x={curx} y={cury} retPos={verifyChar} />
      </div>
      <div>
        <p className="mfooter"><a href="https://www.instagram.com/ad.2.222/">Image by Egor Klyuchnyk / Lucio</a></p>
      </div>
    </div>
  );
}

/******************  1.PART OF MAIN PAGE (SEPARATE)  ******************/

const Crossout = (props) => {

  const myStyleBox = {
    position: "relative",
    display: "inline-block",
    top: -100,
    fontSize: "50px",
    color: "red"
  };

  if (props.show) {

    return (
      <div style={myStyleBox}>
        X
      </div>
    );
  } else {

    return null;
  }

}

const DropMenu = (props) => {

  const myStyleBox = {
    position: "absolute",
    display: "inline-block",
    top: props.y - 40,
    left: props.x - 40
  };

  const myStyle = {
    position: "absolute",
    display: "inline-block",
    top: props.y - 40,
    left: props.x + 48
  };

  if (props.show) {

    return (
      <div className="dropdown" >
        <div className="ddbox" style={myStyleBox}></div>
        <div id="myDropdown" className="dropdown-content dropdown_menu-6" style={myStyle}>
          <a onClick={e => { props.retPos(0); }}>Violet Minion</a>
          <a onClick={e => { props.retPos(1); }}>Train Cat</a>
          <a onClick={e => { props.retPos(2); }}>Pig Baby</a>
        </div>
      </div>
    );
  } else {

    return null;
  }
}

const TimeContainer = (props) => {

  if (props.start) {
    return <TimeDisplay ret={props.ret} />;
  } else {
    return <h1>00:00</h1>
  }
};

const TimeDisplay = (props) => { // 0 = Start, 1 = stop and return

  const [intervalId, setIntervalId] = useState(0);
  const [stime, setStime] = useState(0);
  const [ttime, setTtime] = useState("00:00");

  const updateTime = () => {

    setStime(prev => {

      let smin = (Math.floor((prev + 1) / 60)).toString();
      let ssec = ((prev + 1) % 60).toString();

      smin = smin.padStart(2, '0');
      ssec = ssec.padStart(2, '0');

      setTtime(smin + ":" + ssec);

      return prev + 1;
    });
  }

  useEffect(() => {

    const interId = setInterval(updateTime, 1000);
    setIntervalId(interId);

    return () => {


      setStime(prev => {
        //console.log(prev);
        props.ret(prev);

        return 0;
      });

      clearInterval(intervalId);
    };

  }, []);

  return (
    <div className="cTimer">
      <h1>{ttime}</h1>
    </div>
  );
};


/***************************** 2.Welcom Page **********************/

const WelcomeModal = (props) => {


  const [modalIsOpen, setModalIsOpen] = useState(true);


  const setModalIsOpenToTrue = () => {
    setModalIsOpen(true);
  }

  const setModalIsOpenToFalse = () => {
    setModalIsOpen(false);
    props.ret();
  }



  // https://stackoverflow.com/questions/48269381/warning-react-modal-app-element-is-not-defined-please-use-modal-setappeleme

  return (
    <Modal className="welcomePage" isOpen={modalIsOpen} onRequestClose={() => setModalIsOpenToFalse()} ariaHideApp={false}>
      <div >
        <div className="whead">
          <h1>Welcome to game</h1>
        </div>
        <div className="wimage">
          <div>
            <img className="imgwborder" src="./pic/Violet Minion.png" alt="Violet Minion" />
            <p>Violet Minion</p>
          </div>
          <div>
            <img className="imgwborder" src="./pic/Yellow Cat.png" alt="Train Cat" />
            <p>Train Cat</p>
          </div>
          <div>
            <img className="imgwborder" src="./pic/Pig Baby.png" alt="Pig Baby" />
            <p>Pic Baby</p>
          </div>
        </div>
        <div className="wbody">
          <h3>Please help us to find 3 persons hidden in this image.</h3>
        </div>
      </div>
    </Modal>
  );
};

/***************************** 3.End Page **********************/

const EndContainer = (props) => {

  if (props.show) {
    return <EndModal numtime={props.numtime} mlist={props.mlist} saveName={props.saveName} />;
  } else {
    return null;
  }
}

const EndModal = (props) => {

  const [modalIsOpen, setModalIsOpen] = useState(true);


  const setModalIsOpenToTrue = () => {
    setModalIsOpen(true);
  }

  const setModalIsOpenToFalse = () => {
    setModalIsOpen(false);
  }

  return (
    <Modal className="endPage" isOpen={modalIsOpen} ariaHideApp={false}>
      <EndForm numtime={props.numtime} mlist={props.mlist} saveName={props.saveName} />
    </Modal >
  );
};

const EndForm = (props) => {

  const [name, setName] = useState("");
  const [dis, setDis] = useState(false);

  const tableStyle = {
    width: "50%",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: "4px",
    borderColor: "black",
    marginLeft: "auto",
    marginRight: "auto",
  }

  const displayTable = props.mlist.map(ele => {
    return (
      <tr key={ele.name}>
        <td>{ele.name}</td>
        <td>{ele.time}</td>
      </tr>
    )
  });

  const displayTime = () => {

    let smin = (Math.floor((props.numtime) / 60)).toString();
    let ssec = ((props.numtime) % 60).toString();

    smin = smin.padStart(2, '0');
    ssec = ssec.padStart(2, '0');

    return (smin + ":" + ssec);
  };




  const handleSubmit = (e) => {
    e.preventDefault();

    const myObj = {
      name: name,
      time: Number(props.numtime),
      date: Date.now()
    };

    setDis(true);
    props.saveName(myObj);
  };

  const handleChange = (e) => {
    setName(e.target.value);
  }

  return (

    <div >
      <div className="ehead">
        <h1>Congratualtions !</h1>
        <p>Your time is : {displayTime()} </p>
      </div>

      <div className="eform">

        <form onSubmit={e => handleSubmit(e)}>
          <label>Please input your name :
            <input value={name} onChange={e => handleChange(e)} type="text" name="name" placeholder="Your name here" disabled={dis} />
          </label>
          <input type="submit" value="OK" disabled={dis} />
        </form>

      </div>

      <div className="etable">
        <br />
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Time(s)</th>
            </tr>
          </thead>
          <tbody>

            {displayTable}

          </tbody>
        </table>

      </div>


      <div className="efooter">

      </div>
    </div>
  );
};

export default App;