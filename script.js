var remote = 'https://anc.d3.net/intermed/'
// var remote = 'https://anc.local/intermed/'

fetch('testimonials.json')
.then(response => response.json())
.then(data => {
    const carouselIndicator = document.getElementById('carousel-indicators-testimonials');
    const carouselInner = document.getElementById('carousel-inner-testimonials');
    data.forEach((item, index) => {
        const slideClass = index === 0 ? 'carousel-item active' : 'carousel-item';
        const slideContent = `
            <div class="${slideClass}">
                <figure class="t-figure">
                    <div class="row g-0">
                        <div class="col-12 col-sm-8">
                            <p class="t-quote"><i>"${item.message}"</i></p>
                        </div>
                        <div class="col-12 col-sm-4 t-person">
                            <img src="${item.picture}" class="t-avatar" alt="${item.name}" />
                            <p class="t-name">${item.name}</p>
                        </div>
                    </div>
                </figure>
            </div>`;
        carouselInner.innerHTML += slideContent;
        const btnClass = index === 0 ? 'active' : '';
        const btnContent = `<button type="button" data-bs-target="#carousel-testimonials" data-bs-slide-to="${index}"
                        class="${btnClass}" ${index === 0 ? 'aria-current="true"':''} aria-label="Testimonial ${index+1}"></button>`;
        carouselIndicator.innerHTML += btnContent;
    });
});
function CheckHash(){
    let elem = $(window.location.hash || '#home')
    if(elem){
        let scrollY = elem.position().top
        console.log('y', scrollY)
        window.scrollTo({
            top:scrollY,
            left:0,
            behavior:'smooth'
        })
    }
    $('a.scroll-to-section').removeClass('active')
    $(`a.scroll-to-section[href="${window.location.hash}"]`).addClass('active')
}
function NavBarMenu(){
    if (window.scrollY > 0)  $('#navbar-menu').removeClass('bg-white-gradient').addClass('navbar-light bg-white')
    else $('#navbar-menu').removeClass('navbar-light bg-white').addClass('bg-white-gradient')
}
function SelectBranchLocation(alias){
    $('.location-details').addClass('d-none')
    $(`#location-details-${alias}`).removeClass('d-none')
    $('.pin-map').removeClass('active')
    $(`#pin-map-${alias}`).addClass('active')
}
fetch(remote+'?action=courses')
.then(response => response.json())
.then(data => {
    $('#courses-details').html('')
    $('#inquiry-for').html('')
    let counter = 0;
    for (const k in data){
        const course = data[k]
        let rowPos = (counter/4).toString().split('.')[1] || 0
        //<div class="d-flex justify-content-between mb-3">
        //<h6>Next Class:</h6>
        //<h6>${course.next || 'No schedule yet'}</h6>
        //</div>
        $('#courses-details').append(`
            <div class="col mb-3" data-reveal="depth" data-reveal-delay="${(counter * 0.08).toFixed(2)}">
                <div class="card course-card h-100 border-0 rounded-5 blue-abstract-${rowPos} tilt-sheen" data-tilt data-tilt-max="6">
                    <div class="card-header bg-transparent fs-3 border-0">${course.name}</div>
                    <div class="card-body text-secondary">${course.details}</div>
                    <div class="card-footer border-0 bg-transparent">
                        <div class="d-flex justify-content-end">
                            <a href="javascript:void(0);" data-bs-toggle="modal" data-bs-target="#inquiry-modal" data-bs-course="${course.name}" class="join-inquire text-decoration-none">Join or Inquire <i class="bi bi-arrow-right"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `)
        $('#inquiry-for').append(`<option value="${course.name}">${course.name} Course</option>`)
        counter++;
    }
    $('#inquiry-for').append('<option value="Exam">Exams Inquiry</option>')
    $('#inquiry-for').append('<option value="Scholarship">Scholarship Details</option>')
    if (window.motionRefresh) window.motionRefresh(document.getElementById('courses-details'))
})
fetch(remote+'?action=branches')
.then(response => response.json())
.then(data => {
    let locations = {
        //international: {x:10,y:10},
        baguio: {x:125,y:100},
        manila: {x:155,y:175},
        lipa: {x:153,y:208},
        kalibo: {x:215,y:303},
        iloilo: {x:225,y:335},
        cebu: {x:275,y:350},
        cdo: {x:310,y:430},
        davao: {x:350,y:485},
    }
    let places = {
        international: 'ChIJn8Qn_GntljMRjibXqIE2O6o',
        baguio: 'ChIJQzW12nChkTMRzCQcFFQk974',
        manila: 'ChIJD5gibTDJlzMRMe0e6VPPj3s',
        lipa: 'ChIJHXzGjSBtvTMRYHtHGf7pv7Q',
        kalibo: '',
        iloilo: 'ChIJ3x9K-ULlrjMRMJPbUkPp-Cc',
        cebu: '',
        cdo: 'ChIJExpAr6fz_zIRm1Ymu57_rFM',
        davao: ''
    }
    $('#philippine-map').find('.pin-map').remove()
    for (const k in locations){
        const coords = locations[k]
        const pinLeft = (coords.x / 445 * 100).toFixed(2)
        const pinTop = (coords.y / 573 * 100).toFixed(2)
        $('#philippine-map').append(`<a href="javascript:void(0);" id="pin-map-${k}" data-email="${data[k]?.email || data['iloilo'].email}" data-location="${k}" class="pin-map text-nowrap" style="left:${pinLeft}%;top:${pinTop}%"><i class="bi bi-geo-alt-fill"></i><small class="text-capitalize">${k == 'cdo' ? 'cagayan de oro' : k}</small>${['iloilo'].includes(k) ? '<small class="text-danger">*</small>':''}</a>`);
    }
    $('#contact-location-details').html('')
    for (const k in data){
        const location = data[k]
        let address = ''
        if(location.address > '') address += location.address
        if(location.zip > '') address += ' <br />' + location.zip
        if(location.city > '') address += ' ' + location.city
        $('#contact-location-details').append(`
            <div id="location-details-${k}" class="location-details d-none">
                <h3 class="subtitle text-capitalize">${k == 'cdo' ? 'cagayan de oro' : k}</h3>
                <div class="location-details-grid">
                    <div class="location-details-col">
                        ${address == '' ? '': `
                            <div class="d-flex align-items-center">
                                <i class="bi bi-geo-alt-fill"></i>
                                <p class="m-0 px-2">${places[k] > '' ? `<a href="https://www.google.com/maps/place/?q=place_id:${places[k]}" target="_blank">${address}</a>`:address}</p>
                            </div>
                        `}
                        <div class="d-flex align-items-center">
                            <i class="bi bi-telephone-fill"></i>
                            <p class="m-0 px-2">
                                <a href="tel:${location.phone}" target="_blank">${location.phone}</a> <br /> 
                                <a href="tel:${location.phone}" target="_blank">${location.mobile}</a>
                            </p>
                        </div>
                    </div>
                    <div class="location-details-col">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-envelope-fill"></i>
                            <p class="m-0 px-2"><a href="mailto:${location.email}" target="_blank">${location.email}</a></p>
                        </div>
                        <div class="d-flex align-items-center">
                            <i class="bi bi-facebook"></i>
                            <p class="m-0 px-2">${k == 'international' ?'<a href="https://www.facebook.com/intermedabroad" target="_blank">@intermedabroad</a>':'<a href="https://www.facebook.com/intermedph" target="_blank">@intermedph</a>'}</p>
                        </div>
                        ${k == 'international' ? '':`
                            <div class="d-flex align-items-center">
                                <i class="bi bi-messenger"></i>
                                <p class="m-0 px-2"><a href="https://www.facebook.com/msg/intermedph" target="_blank">Send Message</a></p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `)
    }
    SelectBranchLocation('iloilo') //select default selected branch
    document.getElementById('contact-to').value = data['iloilo'].email
    $('.pin-map').click(function(){
        SelectBranchLocation($(this).data('location'))
        document.getElementById('contact-to').value = $(this).data('email')
    })
})
fetch('faqs.json')
.then(response => response.json())
.then(data => {
    $('#faq-accordion').html('')
    data.forEach((item, index) => {
        $('#faq-accordion').append(`
            <div class="accordion-item" data-reveal="up" data-reveal-delay="${(index * 0.05).toFixed(2)}">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapse-${index}" aria-expanded="false" aria-controls="collapse-${index}">
                        ${item.question}
                    </button>
                </h2>
                <div id="collapse-${index}" class="accordion-collapse collapse" data-bs-parent="#faq-accordion">
                    <div class="accordion-body">
                        ${item.answer}
                    </div>
                </div>
            </div>`)
    });
    if (window.motionRefresh) window.motionRefresh(document.getElementById('faq-accordion'))
});

var date = new Date()
var year = date.getFullYear()
$('#year').html(year)

window.addEventListener('scroll', e => {
    NavBarMenu()
})
window.addEventListener('load', e => {
    NavBarMenu()
})
        

$(document).ready(async function(){
    CheckHash()
    $('a.scroll-to-section[href^="#"]').click(function(e){
        $('a.scroll-to-section').removeClass('active')
        $(`a.scroll-to-section[href="${e.target.hash}"]`).addClass('active') 
    })

});
// document.getElementById('apply-scholarship-form').addEventListener('submit', async e => {
//     e.preventDefault()
//     let formData = new FormData(document.getElementById('apply-scholarship-form'))
//     formData.append('action', 'apply-scholarship')
//     console.log('form data', formData)
//     console.log('name', formData.get('name'))
//     let response = await submitFormData(formData)
//     if(response.code == 200){
//         console.log('sent')
//     }
// })
document.getElementById('contact-us-form').addEventListener('submit', async e => {
    e.preventDefault()
    const submitButton = document.querySelector('#contact-us-form button[type="submit"]')
    const submitHTML = submitButton.innerHTML
    submitButton.disabled = true
    submitButton.innerHTML = 'Sending...'
    let formData = new FormData(document.getElementById('contact-us-form'))
    formData.append('action', 'contact')
    let response = await submitFormData(formData)
    if(response.code == 200){
        document.querySelector('#contact-us-form p.notifier').classList.remove('d-none')
        setTimeout(function(){
            document.querySelector('#contact-us-form p.notifier').classList.add('d-none')
            document.querySelector('#contact-us-form').reset()
        }, 5000);
    }

    submitButton.disabled = false
    submitButton.innerHTML = submitHTML
})

async function submitFormData(formData) {
    let response = await fetch(remote, {
      method: 'POST',
      body: formData
    });
    if(response.status == 200){
        let data = await response.json()
        return data
    }else{
        return {code: response.status, message: 'Something went wrong'}
    }
}

const inquiryModal = document.getElementById('inquiry-modal')
if (inquiryModal) {
    inquiryModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget
        const course = button.getAttribute('data-bs-course')
        console.log('course', course)
        const inquiryFor = inquiryModal.querySelector('.modal-body select[id="inquiry-for"]')
        inquiryFor.value = course
        const modalForm = inquiryModal.querySelector('.modal-body form')
        modalForm.addEventListener('submit', async e => {
            e.preventDefault()
            const submitButton = modalForm.querySelector('.modal-body button[type="submit"]')
            const submitHTML = submitButton.innerHTML
            submitButton.disabled = true
            submitButton.innerHTML = 'Sending...'
            let formData = new FormData(modalForm)
            formData.append('action', 'inquiry')
            let response = await submitFormData(formData)
            if(response.code == 200){
                modalForm.querySelector('p.notifier').classList.remove('d-none')
                setTimeout(function(){
                    modalForm.querySelector('p.notifier').classList.add('d-none')
                    modalForm.reset()
                    $('#inquiry-modal').modal('hide')
                }, 5000);
            }
            submitButton.disabled = false
            submitButton.innerHTML = submitHTML
        }) 
    })
    inquiryModal.addEventListener('hide.bs.modal', event => {
        const modalForm = inquiryModal.querySelector('.modal-body form')
        modalForm.reset() 
    })
}

const applicationModal = document.getElementById('application-modal')
if (applicationModal) {
    applicationModal.addEventListener('show.bs.modal', event => {
        const button = event.relatedTarget
        const title = button.getAttribute('data-bs-title')
        applicationModal.querySelector('.modal-body input[name="for"]').value = title
        applicationModal.querySelector('#application-modal-label').innerHTML = title
        const modalForm = applicationModal.querySelector('.modal-body form')
        modalForm.addEventListener('submit', async e => {
            e.preventDefault()
            const submitButton = modalForm.querySelector('.modal-body button[type="submit"]')
            const submitHTML = submitButton.innerHTML
            submitButton.disabled = true
            submitButton.innerHTML = 'Sending...'
            let formData = new FormData(modalForm)
            formData.append('action', 'application')
            let response = await submitFormData(formData)
            if(response.code == 200){
                modalForm.querySelector('p.notifier').classList.remove('d-none')
                setTimeout(function(){
                    modalForm.querySelector('p.notifier').classList.add('d-none')
                    modalForm.reset()
                    $('#application-modal').modal('hide')
                }, 5000);
            }
            submitButton.disabled = false
            submitButton.innerHTML = submitHTML
        }) 
    })
    applicationModal.addEventListener('hide.bs.modal', event => {
        const modalForm = applicationModal.querySelector('.modal-body form')
        modalForm.reset() 
    })
}