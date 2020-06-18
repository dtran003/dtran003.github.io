import React, {useState, useRef} from 'react';
import logo from './logo.svg';
import './App.css';

function LyricsField(props){
  const inputStyle = {
    width: '500px',
    border: 0,
    fontWeight: props.focused? "bold":"normal"
  }
 
  const convertTime=(t)=>{
    let seconds = t%60;
    let minutes = (t-seconds)/60;
    if (seconds<10){
      seconds='0'+seconds.toString();
    }
    return (`${minutes}:${seconds}`);
  }
  const inputField= useRef(null);

  if (inputField.current && props.focused ){
    inputField.current.scrollIntoView();
  }
  return(
  <div  className="container" style={{flexDirection:"column"}}>
    <span 
    ref={inputField} 
    style={{fontWeight: props.focused?"bold":"normal"}}
    onClick={(e)=>{
      e.preventDefault(); 
      props.setTime(props.time);
      }
    }>
    {convertTime(props.time)}
    </span>
    <input 
      type="text"
      value={props.text} 
      style={inputStyle}
      onChange={(e)=>{
          e.preventDefault();
          props.editLyrics(e.target.value, props.time);
            }
          }
    >
    </input>

  </div>)
}


function ReadField(props){
  const inputField=useRef(null);
  const convertTime=(t)=>{
    let seconds = t%60;
    let minutes = (t-seconds)/60;
    if (seconds<10){
      seconds='0'+seconds.toString();
    }
    return (`${minutes}:${seconds}`);
  }
  

  if (inputField.current && props.focused ){
    inputField.current.scrollIntoView();
  }
  return(
    <div  className="container" style={{fontWeight: props.focused?"bold":"normal", flexDirection:"column"}}>
    <span 
    ref={inputField} 
    onClick={(e)=>{
      e.preventDefault(); 
      props.setTime(props.time);
      }
    }>
    {convertTime(props.time)}
    </span>
    <div>{props.text}</div>
    </div>
  )
}



function TimeStampList(props){
  const [newTime, setNewTime] = useState(0);
  const add = useRef(null);
  
  let contents;
  let title;
  if (props.isEdit){
    title="Edit";
    contents=Object.keys(props.lyrics).map((t)=>
      <LyricsField 
        text={props.lyrics[t]} 
        focused={t===props.check} 
        time={t} 
        editLyrics={props.editLyrics} 
        setTime={props.setTime}
      />)
  }
  else {
    title = "Read and highlight";
    contents = Object.keys(props.lyrics).map((t)=>
      <ReadField 
        text={props.lyrics[t]} 
        focused={t===props.check} 
        time={t}
        setTime={props.setTime}
      />)
  }

  return(
  <div className="container" style={{flexDirection:"column"}}>
  <div style={{fontSize:20}}>{title}</div>
  <div style={{border: "1px solid black", overflowY: "scroll", height:"200px", width:"800px", flexDirection:"column", justifyContent:"flex-start"}} className="container">
    {contents}
  </div>
  <br></br>
  <div>
  <input type="number" value={newTime} ref={add} onChange={(e)=>{e.preventDefault(); setNewTime(e.target.value)}}></input>
  <button onClick={(e)=>{e.preventDefault(); props.addLyrics(newTime); setNewTime(0)}}>Add timestamp</button>
  </div>
  </div>
  )
}
function App() {
 
  const [editStatus, setEditStatus]=useState(0);
  const musicFile = useRef(null);

  const [fileURL, setURL]=useState(null);

  const musicStream = useRef(null);

  const lyricsFile = useRef(null);

  const [lyrics, setLyrics] = useState('');

  const [time2, setTime2]=useState(0);

  const [isEditing, setEdit] = useState(true);

  const [searchText, setSearchText] = useState('');

  const editLyrics=(text, time)=>{
    let bufferLyrics=lyrics;
    bufferLyrics[time]=text;
    setLyrics(bufferLyrics);
    if (editStatus===1){
      setEditStatus(2);
      return
    }
    setEditStatus(1);
  }


  const addLyrics=(t)=>{
    let bufferLyrics=lyrics;
    bufferLyrics[t]='lyrics';
    setLyrics(bufferLyrics);
    if (editStatus===1){
      setEditStatus(2);
      return
    }
    setEditStatus(1);
  }
  const fileSubmit = (e)=>{
    e.preventDefault();
    alert(`${musicFile.current.files[0].name}`);
    setURL(URL.createObjectURL(musicFile.current.files[0]));
  }

  let playBackButtons = null;
  if (musicStream.current){
    playBackButtons=<div className='container' style={{flexDirection:"column", alignItems:"center"}}>
      <div className='container'>
        <button onClick={()=>{musicStream.current.playbackRate=0.5}}>0.5x</button>
        <button onClick={()=>{musicStream.current.playbackRate=0.8}}>0.8x</button>
        <button onClick={()=>{musicStream.current.playbackRate=1}}>1.0x</button>
        <button onClick={()=>{musicStream.current.playbackRate=1.2}}>1.2x</button>
        <button onClick={()=>{musicStream.current.playbackRate=2}}>2.0x</button>

      </div>
      <div className='container'><button onClick={()=>{skipTime(musicStream.current.currentTime+5)}}>Forward 5 seconds</button>
      <button onClick={()=>{skipTime(musicStream.current.currentTime-5)}}>Go back 5 seconds</button></div>
    </div>
  }


  let lyricsFileInput=null;
  const lyricsSubmit = (e)=>{
    e.preventDefault();
    let reader= new FileReader();
    reader.onload = function(e){
      let text = reader.result;
      alert(text);
      const json = JSON.parse(text)
      setLyrics(json);

    }
    reader.readAsText(lyricsFile.current.files[0]);
  }
  
  const getTime=(e)=>{
    e.preventDefault();
    if (!lyrics || !musicStream){
      return
    }
    let i=0;
    let bufferTime2=0;
    while (musicStream.current.currentTime>=Object.keys(lyrics)[i]){
      bufferTime2=Object.keys(lyrics)[i];
      i=i+1;
    }
    setTime2(bufferTime2);
  }
  
  function skipTime(t){
    if (!fileURL) {alert("no file"); return}
    musicStream.current.currentTime=t;
  }
    
  let timestamp=<div className="container" style={{border: "1px solid black", overflowY: "scroll", height:"200px", width:"800px"}}></div>;
  if (fileURL && lyrics){
    let lyrics2={};
    if (searchText){
      for (let t in lyrics){
        if (lyrics[t].toString().includes(searchText)){
          lyrics2[t]=lyrics[t]
        }
      }
    }
    else {
      lyrics2=lyrics;
    }  
    timestamp=<TimeStampList isEdit={isEditing} check={time2} lyrics={lyrics2} setTime={skipTime} editLyrics={editLyrics} addLyrics={addLyrics}/>
    }
  
  
  
  lyricsFileInput=<div className="container">
    <label><input style={{display:"none"}}type="file" accept="text/*"ref={lyricsFile} onChange={lyricsSubmit}></input>
        Load lyrics
    </label>
  </div>
  
  const editMode=()=>{
    setEdit(!isEditing);
    setHighlights([]);
  }
  const colorArray=["red", "blue", "green", "yellow", "green"];
  const [highlightColor, setColor] = useState(0);
  const [highlights, setHighlights] = useState([]);

  const highlightText = (e)=>{
    e.preventDefault();
    let bufferHighlights = highlights;
    let range = window.getSelection().getRangeAt(0);
    let newNode = document.createElement("span");
    let color = highlightColor%5;
    newNode.setAttribute("style", `background-color: ${colorArray[color]}`);
    setColor(highlightColor+1);
    range.surroundContents(newNode);

    bufferHighlights.push(range.toString()+"\n");
    setHighlights(bufferHighlights);
  }


  let highlightButton=null;
  if (!isEditing){
    highlightButton=<button onClick={highlightText}>Highlight selected text</button>

  }

  const [linkName, setLinkName] = useState('lyrics.txt');
  const [download, setDownload]= useState([]);
  const exportLyrics=(filename)=>{
    let text = [JSON.stringify(lyrics)];
    const file1 = new Blob(text);
    const lyricsTimeStamp = URL.createObjectURL(file1);

    let noTimestamp=[];
    for (let t in lyrics){
      noTimestamp.push(lyrics[t]+"\n")
    }
    const file2 = new Blob(noTimestamp)
    const noTimestampURL = URL.createObjectURL(file2);

    const file3 = new Blob(highlights);
    const highlightsURL = URL.createObjectURL(file3)
    alert ("Lyrics and highlight saved as "+filename);
    setDownload([filename, lyricsTimeStamp, noTimestampURL, highlightsURL]);

  }
  return(<div className="container" style={{flexDirection:"column", alignItems:"center"}}>
    <div className="container"  style={{flexDirection:"row", justifyContent:"flex-start", width:"800px"}}>
      <div className="container">
        <label><input style={{display:"none"}}type="file" accept="audio/*" ref={musicFile} onChange={fileSubmit}></input>Load music</label>
      </div>
      {lyricsFileInput}
      <button onClick={editMode}>Edit/Highlight</button>
      {highlightButton}
      <input type="text" placeholder="search" value={searchText} onChange={(e)=>{e.preventDefault(); setSearchText(e.target.value)}}></input>
    </div>

    <div className='container'>{timestamp}</div>
    <div className="container"><audio src={fileURL} controls ref={musicStream} onTimeUpdate={getTime} style={{"width":"800px"}}></audio></div>
    {playBackButtons}
    <div>
    <button onClick={(e)=>{e.preventDefault(); exportLyrics(linkName)}}>Save and export lyrics/highlights as</button>:
    <input type='text' value={linkName} onChange={(e)=>setLinkName(e.target.value)}></input>
    </div>
    <div className='container' style={{flexDirection:'column', alignItems:"center"}}>
    <a href={download[1]} download={download[0]}>Export lyrics to be reused</a>
    <a href={download[2]} download={download[0]}>Export lyrics without timestamp</a>
    <a href={download[3]} download={download[0]}>Export highlights only</a>
    </div>



  </div> 
  )
}

export default App;
