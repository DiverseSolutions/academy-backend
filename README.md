# academy-backend

## About The Project
Ard academy веб хуудсын backend сервис /Directus/.


## Prerequisites
Ажлуулахын тулд Node болон MariaDB шаардлагатай
* Node
    ```
    Node version v18.17.1
    ```
* MariaDB 
  ```sh
  11.1.2-MariaDB-1:11.1.2+maria~deb11
  ```

## Installation
Github дээрээс ard-academy organization дотор academy нэртэй repository-г өөрийн local pc дээрээ clone хийж авна. Terminal дээрээс тухайн прожектийн зам дээр очин дараах коммандыг хийж прожектийг асаана. Асаахаас өмнө MySQL сервис асаасан байх шаардлагатай.
```sh
npx directus start
```
.env файл дээрээс өөрийн credential-ийг тааруулж өгнө.

## Deployed Server
Одоогоор AWS сервер дээр (18.140.172.160:8055) deploy хийгдсэн байгаа. Connect хийх key, user болон IP-ийг кодоор орууллаа. services-tibi.pem key-ийг Developer-оос нь эсвэл AWS эрхээр орж авч болно.
```sh
ssh -i services-tibi.pem bitnami@18.140.172.160
```
Сервер дээр nginx ажиллаж байгаа энэ нь гаднаас ирсэн хүсэлтийг reverse proxy хийж өгч байгаа. Үүнд:
```sh 
    /api -> http://localhost:8055 /backend/
    /    -> http://localhost:8080 /frontend/
```
дараах портууд дээр proxy pass хийж өгч байгаа. <br>

SSL нь free SSL бөгөөд letsencrypt ашигласан. Энэ нь 3 сар үнэгүй байдаг тул сунгалт хийх шаардлагатай.


## End Points

<!-- End points -->
<details>
  <summary>Categories router</summary>
  <br>
  <li>
    /categories - <b>GET</b>
    <br>
    Бүх категорийг татаж авна.
  </li>
  <br>
  <li>
    /categories/:id/posts?page=&size= - <b>GET</b>
    <br>
    Тухайн категори-д хамааралтай нийтлэлийг татна. page болон size явуулснаар нийтлэлүүдийг хуудаслаж татна.
  </li>
  <br>
  <li>
    /categories/top - <b>GET</b>
    <br>
    Хамгийн их хандалттай нийтлэлүүдтэй категоруудыг татна.
  </li>
  <br>
</details>

<details>
  <summary>Posts router</summary>
  <li>
    /posts?page=&size=&featured=true - <b>GET</b>
    <br>
    Featured нийтлэлийг хуудаслаж татна. Featured нь admin хуудас дээрээс сонгосон нийтлэлээ featured болгон харуулах боломжтой.
  </li>
  <li>
    /posts?page=&size=&trending=true - <b>GET</b>
    <br>
    Trending буюу хамгийн их хандалттай нийтлэлүүдийг татна.
  </li>
  <li>
    /posts?page=&size=&type= - <b>GET</b>
    <br>
    Type буюу нийтлэлийн төрлөөр шүүлт хийж хуудаслаж татна. Үүнд тухайн төрлийн id байх шаардлагатай.
  </li>
  <li>
    /posts?page=&size= - <b>GET</b>
    <br>
    Нийтлэлүүдийг хуудаслаж татна.
  </li>
  <li>
    /posts/:id - <b>GET</b>
    <br>
    Тухайн нийтлэлийн дэлгэрэнгүй мэдээллийг татна. Энэ нь тухайн нийтлэл рүү дарж орход ажиллана.
  </li>
  <li>
    /posts/:id/comments?page=&size= - <b>GET</b>
    <br>
    Тухайн нийтлэлийн комментийг хуудаслаж татна.
  </li>
  <li>
    /posts/:id/comments - <b>POST</b>
    <br>
    Тухайн нийтлэл дээр сэтгэгдэл бичнэ. <br>
    Хүсэлт дээр name болон content гэсэн өгөгдөл body хэсэгт хүлээж авна.
  </li>
  <br>
</details>

<details>
  <summary>Subscribers router</summary>
  <li>
    /subscribers/emails 
  </li>
  <li>
    /subscribers/notify 
  </li>
  <li>
    /subscribers 
  </li>
  Энэхүү router-ийг пост орох тохиолдолд админ хуудаснаас email subcribe хийсэн хэрэглэгч нарлуу email илгээж мэдээллэх байдлаар ашиглаж болно. 
  <br>
  .env файл дээр тухайн sender mail credential тааруулах боломжтой.

  <br>
</details>