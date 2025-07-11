function Button({toggleListening, isListening, error}) {

  return (
    <div style={{zIndex: "1"}}>
      {/* <h2>Голос в текст</h2> */}
      <button onClick={toggleListening}>
        {isListening ? "Остановить" : "Начать запись"}
      </button>
      <div>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Button;
