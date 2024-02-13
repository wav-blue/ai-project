const QuestionInput = () => {

  return (
    <div>
      <div className="flex flex-row gap-1 mt-10 form fixed bottom-[100px]">
        <textarea
          className="border-2 border-[#0c0b0b] rounded-md min-w-[500px] min-h-[70px] bg-white/70"
          placeholder="고민을 입력하세요."
          // onChange={e => setUserInput(e.target.value)}
        />

        <div className="flex flex-col gap-1 justify-center">
          <label htmlFor='file-upload' className='border-2 border-[#0c0b0b] bg-white rounded-md flex justify-center'> 📎 </label>
          <input id="file-upload" className='hidden' type="file" accept="image/*" placeholder="📎" />
          <button
            // onClick={handleSubmit}
            className="max-w-10 border-2 border-[#0c0b0b] bg-white rounded-md"
          >
            🔺
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuestionInput;