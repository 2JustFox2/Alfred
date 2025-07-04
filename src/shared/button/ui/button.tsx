function Button({toggleListening, isListening, text, error}) {

  return (
    <div>
      <h2>Голос в текст</h2>
      <button onClick={toggleListening}>
        {isListening ? "Остановить" : "Начать запись"}
      </button>
      <div>
        <p>{text}</p>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    </div>
  );
}

export default Button;
