let currentScreen="nameScreen";
let userName="",userAge="",edu="",stream="";
let currentQuestion=0,score=0;
let answered=false;
let questions=[]; // holds fetched questions
let preloading=false;

function switchScreen(id){
  document.getElementById(currentScreen).classList.remove("active");
  document.getElementById(id).classList.add("active");
  currentScreen=id;
}

function showLoader(show){document.getElementById("loaderWrapper").style.display=show?"flex":"none";}

function goToAge() {
  userName = document.getElementById("userName").value.trim();
  if(!userName){
    showMessage("Enter your name!");
    return;
  }
  switchScreen("ageScreen");
}

function goToEducation() {
  userAge = document.getElementById("userAge").value.trim();
  if(!userAge){
    showMessage("Enter your age!");
    return;
  }
  switchScreen("eduScreen");
}

function backToAge(){switchScreen("ageScreen");}

// Streams with new sections
const streams={
  "School":[
    "Class 1","Class 2","Class 3","Class 4","Class 5",
    "Class 6","Class 7","Class 8","Class 9","Class 10",
    "Class 11 Science","Class 11 Commerce","Class 11 Arts",
    "Class 12 Science","Class 12 Commerce","Class 12 Arts"
  ],
  "Graduation":[
    "B.Sc Physics","B.Sc Chemistry","B.Sc Mathematics","B.Sc Biology","B.Sc Computer Science",
    "B.Com General","B.Com Accounting","B.Com Finance","B.Com Taxation",
    "B.A English","B.A History","B.A Economics","B.A Political Science","B.A Psychology",
    "BCA (Computer Applications)","BBA (Business Administration)",
    "B.Tech CSE","B.Tech Mechanical","B.Tech Civil","B.Tech Electrical","B.Tech Electronics",
    "B.Tech IT","B.Tech Chemical","B.Tech Biotechnology","B.Tech Aerospace","B.Tech Automobile"
  ],
  "Post Graduation":[
    "M.Sc Physics","M.Sc Chemistry","M.Sc Mathematics","M.Sc Biology","M.Sc Computer Science",
    "MBA Finance","MBA Marketing","MBA HR","MBA Operations","MBA IT",
    "MCA (Computer Applications)",
    "M.Tech CSE","M.Tech Mechanical","M.Tech Civil","M.Tech Electrical","M.Tech Electronics",
    "M.Tech IT","M.Tech Chemical","M.Tech Biotechnology","M.Tech Aerospace","M.Tech Automobile",
    "MA English","MA History","MA Economics","MA Political Science","MA Psychology"
  ],
  "PhD":[
    "PhD Physics","PhD Chemistry","PhD Mathematics","PhD Biology","PhD Computer Science",
    "PhD Mechanical Engineering","PhD Civil Engineering","PhD Electrical Engineering",
    "PhD Electronics Engineering","PhD IT","PhD Chemical Engineering",
    "PhD Biotechnology","PhD Aerospace Engineering","PhD Automobile Engineering",
    "PhD Economics","PhD History","PhD English","PhD Political Science","PhD Psychology",
    "PhD Management","PhD Finance","PhD Marketing","PhD HR","PhD Operations"
  ],
  
  "Coding": [
    "Python","JavaScript","C++","Java","C#","Ruby","Go","Rust","PHP","Swift","Kotlin"
  ],
  "Analytical": [
    "Logical Reasoning","Data Interpretation","Puzzle Solving","Critical Thinking","Pattern Recognition"
  ],
  "Grammar Practice": [
    "Tenses","Parts of Speech","Punctuation","Sentence Correction","Vocabulary","Comprehension"
  ],
  "All Subjects": [
    "Mathematics","Physics","Chemistry","Biology","General Science","History","Geography","Computer Basics","Soft Skills"
  ]
};

function selectEdu(level){
  edu=level;
  document.getElementById("streamTitle").innerText="Select Stream for "+level;
  const box=document.getElementById("streamOptions");
  box.innerHTML="";
  streams[level].forEach(s=>{
    const div=document.createElement("div");
    div.className="option-btn";
    div.innerText=s;
    div.onclick=()=>startQuiz(s);
    box.appendChild(div);
  });
  switchScreen("streamScreen");
}
function backToEdu(){switchScreen("eduScreen");}

// Fetch questions (same logic as before)
async function fetchQuestionsBatch(eduLevel,streamName,count=3){
 const apiUrl = "";//replce your url 
  const apiKey = ""; // Replace with your key
  const prompt=`Generate ${count} multiple choice questions for a ${eduLevel} student in ${streamName}.
Each question should have 4 options and indicate the correct answer.
Return JSON array only with fields: question, options (array), answer (string).`;

  try{
    const response=await fetch(apiUrl,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":"Bearer "+apiKey
      },
      body:JSON.stringify({
        model:"gpt-4o-mini",
        messages:[
          {role:"system",content:"You are a quiz question generator."},
          {role:"user",content:prompt}
        ]
      })
    });
    const json=await response.json();
    let text=json.choices?.[0]?.message?.content||"[]";
    text=text.replace(/```json|```/g,"").trim();
    let arr=JSON.parse(text);

    // Normalize
    arr=arr.map(q=>({
      question:q.question || q.Question || "",
      options:q.options || q.choices || [],
      answer:q.answer || q.correct || q.correctAnswer || ""
    }));
    return arr;
  }catch(e){
    console.error(e);
    return [];
  }
}

async function preloadQuestions(){
  if(preloading) return;
  preloading=true;
  showLoader(true);
  const more=await fetchQuestionsBatch(edu,stream,2);
  questions=questions.concat(more);
  showLoader(false);
  preloading=false;
}

async function startQuiz(selectedStream) {
  stream = selectedStream;
  currentQuestion = 0;
  score = 0;
  questions = [];
  
  document.getElementById("quizHeader").innerText = stream + " Quiz";
  
  switchScreen("quizScreen");
  showLoader(true);
  
  questions = await fetchQuestionsBatch("General", stream, 3);
  
  showLoader(false);
  
  if (questions.length > 0) {
    loadQuestion();
    preloadQuestions();
  }
}

function loadQuestion(){
  if(!questions[currentQuestion]) return;
  answered=false;
  const q=questions[currentQuestion];
  document.getElementById("questionText").innerText=`Q${currentQuestion+1}: ${q.question}`;
  const ansDiv=document.getElementById("answers");
  ansDiv.innerHTML="";
  document.getElementById("feedback").innerText="";
  q.options.forEach(opt=>{
    const btn=document.createElement("button");
    btn.innerText=opt;
    btn.onclick=()=>checkAnswer(btn,opt,q.answer);
    ansDiv.appendChild(btn);
  });
  document.getElementById("backBtn").style.display=currentQuestion===0?"none":"inline-block";
}

function checkAnswer(btn,selected,correct){
  if(answered) return;answered=true;
  let feedbackText="";
  if(selected===correct){
    score++;
    btn.style.background="green";
    btn.innerText+=" ✅ Correct";
    feedbackText=`✅ Correct! The answer is: ${correct}`;
  } else {
    btn.style.background="red";
    btn.innerText+=" ❌ Wrong";
    feedbackText=`❌ Your Answer: ${selected}\n✅ Correct Answer: ${correct}`;
  }
  document.querySelectorAll("#answers button").forEach(b=>{
    if(b.innerText===correct || b.innerText.replace(" ✅ Correct","")===correct){
      b.style.background="green";
      if(!b.innerText.includes("Correct")) b.innerText+=" ✅ Correct";
    }
  });
  document.getElementById("feedback").innerText=feedbackText;
}

function nextQuestion(){
  if(currentQuestion<questions.length-1){
    currentQuestion++;loadQuestion();
    if(currentQuestion+2>=questions.length){preloadQuestions();}
  }
}
function prevQuestion(){
  if(currentQuestion>0){currentQuestion--;loadQuestion();}
}
function submitQuiz(){
  switchScreen("resultScreen");
  document.getElementById("result").innerText=`You answered ${questions.length} questions and got ${score} correct.`;

  // Trigger achievement animation from center of result screen
  const rect = document.getElementById("resultScreen").getBoundingClientRect();
  const centerX = window.innerWidth / 2; // center of screen
  const centerY = window.innerHeight / 2; 

  for(let i=0;i<100;i++){ // number of particles
    createParticle(centerX, centerY);
  }
}

// Particle function for burst animation
function createParticle(x, y) {
  const particle = document.createElement('div');
  particle.className = 'particle';
  particle.style.left = x + 'px';
  particle.style.top = y + 'px';
  particle.style.backgroundColor = `hsl(${Math.random()*360}, 100%, 50%)`;
  particle.style.width = (Math.random()*8 + 4) + 'px';
  particle.style.height = (Math.random()*8 + 4) + 'px';

  // Random angle and distance for burst
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * 300 + 150;

  const targetX = x + Math.cos(angle) * distance;
  const targetY = y + Math.sin(angle) * distance;

  particle.animate([
    { transform: 'translate(0, 0)', opacity: 1 },
    { transform: `translate(${targetX - x}px, ${targetY - y}px)`, opacity: 0 }
  ], {
    duration: 1500 + Math.random()*500,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  });

  particle.addEventListener('animationend', () => particle.remove());
  document.body.appendChild(particle);
}
function restartQuiz(){
  switchScreen("nameScreen");
  document.getElementById("userName").value="";
  document.getElementById("userAge").value="";
  questions=[];score=0;currentQuestion=0;
}
function showMessage(msg, duration=2000) {
  const container = document.getElementById("msgContainer");
  container.innerText = msg;
  container.style.display = "block";

  setTimeout(() => {
    container.style.display = "none";
  }, duration);
}
const titles = ["Dynamic Quiz", "Fun Learning", "Test Your Skills", "Level Up!"];
let titleIndex = 0;
const titleEl = document.getElementById("quizTitle");

function animateTitle() {
  // Fade out
  titleEl.classList.add("fade-up-out");
  titleEl.classList.remove("fade-up-in");

  setTimeout(() => {
   
    titleIndex = (titleIndex + 1) % titles.length;
    titleEl.innerText = titles[titleIndex];

    // Fade in
    titleEl.classList.remove("fade-up-out");
    titleEl.classList.add("fade-up-in");

    // Repeat after delay
    setTimeout(animateTitle, 2000); // Show each title for 2s
  }, 800); 
}

window.addEventListener("load", () => {
  titleEl.classList.add("fade-up-in"); 
  setTimeout(animateTitle, 2000); // Start loop after 2s
});

