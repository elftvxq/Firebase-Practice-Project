const contentList = document.querySelector('#content-list');
const articleForm  = document.querySelector('#add-article-form');
const addArticleButton = document.querySelector('#addArticle')
const searchForm = document.querySelector('#search-form');
// console.log(searchForm);
const searchInput = document.querySelector('#searchFr');
let searchInputText = "";
const frList = document.querySelector('#friend-list');
const searchTag = document.querySelector('#searchTag');
// console.log(articleType);
let articleTag = "";
// console.log(articleTag);
const addFriend = document.querySelector('#add-fr');
let addFriendInput ="";

const waitinglist = document.querySelector('#waiting-list');

const User = {
    friends: [] ,
    id: "0002",
    mail: "emma@mail.com",
    name: "emma"
};
console.log(User);

//對照DB找朋友
let loginUser = db.collection('user').where("mail", "==", User.mail).get().then((snapshot) =>{
    snapshot.forEach(element => {
        // console.log(element.data());
        User.friends = element.data().friends;
        console.log(element.data().friends);
        console.log(User.friends);
        // updateFr = User.friends; console.log(updateFr);
    });
});
// console.log(loginUser);
console.log(User.friends);

// if (User.friends.indexOf('1') > -1) {
//     alert('你們是朋友')
// } else{
//     alert('不是朋友')
// }


//create element and render cafe
function renderCafe(doc){
  let li = document.createElement('li');
  let title = document.createElement('span');
  let content = document.createElement('span');
  let cross = document.createElement('div');
  
  //id對應到資料庫內文件的id id在文件的最上層
  li.setAttribute('data-id', doc.id);
  title.textContent = doc.data().article_title;
  content.textContent = doc.data().article_content;
  cross.textContent='x';

  li.appendChild(title);
  li.appendChild(content);
  li.appendChild(cross);
  contentList.appendChild(li);


  //deleting data
  cross.addEventListener('click',(e)=>{
      e.stopPropagation();
      //找到最外層父元素的id
      let id = e.target.parentElement.getAttribute('data-id');
      //透過把參數傳進去找到個別資料的id，執行刪除
      db.collection('article').doc(id).delete();
  })
}

//呼叫特定資料庫 getting data
//為非同步處理使用promise
//orderBy按照某個順序排列
// db.collection('article').orderBy('article_title').get().then((snapshot) =>{
//     // console.log(article);
//     // console.log(snapshot.docs); 
//     snapshot.docs.forEach(doc => {
//         // console.log(doc.data())
//         renderCafe(doc);
//     });
// })

// var date = new Date();

/**
 * 取得當前時間
 **/
Date.now()                       //  回傳當前的 timestamp（毫秒）
new Date()                       //  回傳目前時間的日期物件

/**
 * 時間（文字）與時間戳記（timestamp）間轉換
 **/
const dateObj = new Date();   
// console.log(dateObj);
// dateObj.getTime();                
// Number(dateObj)+dateObj

//生成隨機變數
function createRandomId() {
    return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
};

// console.log(`randomID`);
//saving data
// const articleForm = document.getElementById('add-article-form');
articleForm.addEventListener('submit',(e)=>{
    const tag = document.getElementsByName('articleType')[0];
    // console.log(tag);
    let tagName = tag.value;
    console.log(tagName);

    e.preventDefault();
    db.collection('article').add({
        article_content: articleForm.articleContent.value,
        article_id: `${createRandomId()}`,
        article_tag: `${tagName}`,
        article_title: articleForm.articleTitle.value,
        author: "emma@mail.com",
        created_time: `${dateObj}`,
    });
    articleForm.articleTitle.value = "";
    articleForm.articleContent.value = "";
})

//real-time listner
db.collection('article').onSnapshot(snapshot => {
    //資料改變的部分
    let changes = snapshot.docChanges();
    // console.log(changes);
    changes.forEach(change => {
        if(change.type == 'added'){
            renderCafe(change.doc);
        }else if (change.type == 'removed'){
            //對應被刪除項目的id
            let li = contentList.querySelector('[data-id=' + change.doc.id + ']');
            contentList.removeChild(li);
        }
    });

})



// 搜尋好友的文章
const sendSearch = document.querySelector('#sendSearch');
sendSearch.addEventListener('click', (tar)=> {
    tar.preventDefault();
    searchInputText = searchInput.value;
    console.log(searchInputText);
    console.log(User.friends);

    //點擊之後option才會抓到最新的value
    articleTag = searchTag.value;

    if (User.friends.filter(item => item === searchInputText).length > 0) {
        contentList.innerHTML = '';

        db.collection('article').where("author", "==", searchInputText).where("article_tag", "==", articleTag).get().then((snapshot) => {
        
        snapshot.docs.forEach(info => {
            // console.log(info.data().article_tag);
            renderFriend(info);
            });
      })

    } else{
        alert('未填寫資料或你們不是朋友，請先加入好友^^');
    }
    
})


function renderFriend(info) {
    let li = document.createElement('li');
    let title = document.createElement('span');
    let content = document.createElement('span');
    let cross = document.createElement('div');

    //id對應到資料庫內文件的id id在文件的最上層
    li.setAttribute('data-id', info.id);
    title.textContent = info.data().article_title;
    content.textContent = info.data().article_content;
    cross.textContent = 'x';

    li.appendChild(title);
    li.appendChild(content);
    li.appendChild(cross);
    contentList.appendChild(li);


    //deleting data
    cross.addEventListener('click', (e) => {
        e.stopPropagation();
        //找到最外層父元素的id
        let id = e.target.parentElement.getAttribute('data-id');
        //透過把參數傳進去找到個別資料的id，執行刪除
        db.collection('article').doc(id).delete();
    })
}


//新增好友功能
const sendInvite = document.querySelector('#send-invite');

sendInvite.addEventListener('click',(e)=>{
        e.preventDefault();
        addFriendInput = addFriend.value;
        console.log(addFriendInput);

        // 如果沒有user的狀況
            
            let test = false;
            let userMail = [];
            // let findUser ="";
            db.collection('user').get().then((snapshot) => {
                console.log(snapshot.docs);
                let friend = "";
                for (let i = 0; i < snapshot.docs.length; i++) {
                    if (addFriendInput === snapshot.docs[i].data().mail) {
                        friend += `<p>使用者資料</p>`;
                        friend += `<p>name: ${snapshot.docs[i].data().name}</p>`;
                        friend += `<p>id: ${snapshot.docs[i].data().id}</p>`;
                        friend +=  `<button id="fr-invite" onclick="sendReq()">好友邀請</button>`;
                        frList.innerHTML = friend;
                        return
                    } else{
                        frList.innerHTML = "此人不存在"
                    } 
                }

                // snapshot.docs.forEach(info => {
                //     userMail = info.data().mail;
                //     console.log(userMail);       
                //     //判斷有問題    
                //     if (addFriendInput !== info.data().mail){
                //         frList.innerHTML = "此人不存在";
                //         console.log(addFriendInput);
                //     } else {
                //         frList.innerHTML = "加好友"
                //     }

                // }); 

                
                
                // (User.friends.filter(item => item === addFriendInput).length > 0 ) {
                //         frList.innerHTML = "已是好友";
                // } if (userMail.includes(addFriendInput) == false){
                //         frList.innerHTML = "此人不存在";
                // } else (userMail.includes(addFriendInput) == true)
                // {
                //         frList.innerHTML = "加他好友";
                //         frList.innerHTML ="測試"
                // }
                    
                // if (User.friends.filter(item => item === addFriendInput).length > 0) {
                //     frList.innerHTML = '已經是好友囉';
                    
                //     } 

                    // } else if (test === true ){
                    // frList.innerHTML = "加對方好友";
                    // }
                
            }) 
    
});


// const frInvite = document.querySelector('#fr-invite');
// console.log(frInvite);
// frInvite.addEventListener('click',(e)=>{
//     e.preventDefault();
//     alert('有');

// })

// 送出好友邀請功能
function sendReq() {

    if (User.friends.filter(item => item === addFriendInput).length > 0) {
        alert("已經是好友");
    } else {
        db.collection('invite').add({
            invitee: `${addFriendInput}`,
            inviter: "emma@mail.com",
        });
        alert("已送出好友邀請！")
    }
}


let invitation;
let test = false;
//  確認目前好友邀請
db.collection('invite').where("inviter", "==", "emma@mail.com").get().then((snapshot)=>{
    snapshot.docs.forEach(fr=>{
        // test = true;
        // console.log(test);
        // invitation = fr.data().invitee;
        // console.log(invitation);
        renderWaiting(fr);
    })
});

function renderWaiting(fr) {
        // 等待接受邀請
            let li = document.createElement('li');
            let name = document.createElement('span');
            let status = document.createElement('span');
            // let cross = document.createElement('div');

            //id對應到資料庫內文件的id id在文件的最上層
            // li.setAttribute('data-id', doc.id);
            name.textContent = fr.data().invitee;
            status.textContent = "待接受";

            li.appendChild(name);
            li.appendChild(status);
            waitinglist.appendChild(li);
}


//被邀請成為好友資料
db.collection('invite').where("invitee", "==", "emma@mail.com").get().then((snapshot) => {
    snapshot.docs.forEach(fy => {
        // test = true;
        // console.log(test);
        // invitation = fr.data().invitee;
        // console.log(invitation);
        renderReceive(fy);
    })
});


// let updateFr;

function renderReceive(fy) {
    // 等待確認
    let li = document.createElement('li');
    let name = document.createElement('span');
    let status = document.createElement('button');
    status.setAttribute("id","acceptFr");
    li.style.display = "flex";
    // let cross = document.createElement('div');

    //id對應到資料庫內文件的id id在文件的最上層
    li.setAttribute('data-id', fy.id);
    name.textContent = fy.data().inviter;
    status.textContent = "待接受";

    li.appendChild(name);
    li.appendChild(status);
    waitinglist.appendChild(li);

    //按下接受刪除invite此筆資料
    //確認接受之後更新db個人資料好友清單
    //deleting data

    status.addEventListener('click', (e) => {
        e.stopPropagation();
        //找到最外層父元素的id
        let id = e.target.parentElement.getAttribute('data-id');
        //透過把參數傳進去找到個別資料的id，執行刪除
        // updateFr = [];
        // updateFr.push(fy.data().inviter);
        User.friends.push(fy.data().inviter);
        // console.log(updateFr);
        // console.log(fy.data().inviter);
        // console.log(updateFr);
        db.collection('user').doc("VNDg7criu2dz8ONuXRxI").update({friends: updateFr});
        db.collection('invite').doc(id).delete();
    })
}
