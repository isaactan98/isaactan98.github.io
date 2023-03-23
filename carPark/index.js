// * DUMMY DATA FOR CAR PARKING
const json = [
    {
        "carNumber": "MKY 123",
        "entryDate": "2019-01-01 13:10:00",
        "exitDate": "2019-01-01 14:25:00"
    },
    {
        "carNumber": "JHR 111",
        "entryDate": "2019-01-01 16:30:00",
        "exitDate": "2019-01-01 20:20:00"
    },
    {
        "carNumber": "MLK 123",
        "entryDate": "2019-01-01 14:00:00",
        "exitDate": "2019-01-02 16:30:00"
    },
    {
        "carNumber": "WWW 123",
        "entryDate": "2012-11-08 13:10:00",
        "exitDate": "2012-11-08 14:40:00"
    },
]

const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
// * END OF DUMMY DATA

// * SET DATA TO TABLE
let trHtml = ''
json.forEach((item, index) => {
    trHtml += `<tr>
        <td>${index + 1}</td>
        <td>${item.carNumber}</td>
        <td>${item.entryDate}</td>
        <td>${item.exitDate}</td>
    </tr>`
})

document.getElementById('tbody').innerHTML = trHtml

// * FUNCTION START HERE

document.addEventListener('DOMContentLoaded', function () {
    const selection = document.getElementById('selection')
    getSelectChange(selection.value)

    selection.addEventListener('change', function () {
        getSelectChange(this.value)
    })
})

// * SHOW FIELD TO DISPLAY
function showField(id) {
    document.querySelectorAll('.field').forEach((item) => {
        if (item.id != id) {
            item.style.display = 'none'
        }
    })
    document.getElementById(id).style.display = 'block'
}

function getSelectChange(value) {
    switch (value) {
        case '1':
            showField('searchByCar')
            break;
        case '2':
            showField('searchTotalEarn')
            break;
        case '3':
            showField('searchTotalParked')
            break;
        default:
            break;
    }
}

// * Search By Car Number   
function searchByCarNumber() {
    const carNumber = document.getElementById('carNumber').value
    let result = null;

    json.forEach((item) => {
        if (item.carNumber == carNumber) {
            result = item
        }
    })

    if (result) {
        const carResultDiv = document.getElementById('searchByCarResult')
        // calculate total hours and minutes in 12:00 format
        const entryDate = new Date(result.entryDate)
        const exitDate = new Date(result.exitDate)
        const totalHours = Math.floor((exitDate - entryDate) / 1000 / 60 / 60)
        const totalMinutes = Math.floor((exitDate - entryDate) / 1000 / 60) - (totalHours * 60)

        carResultDiv.style.display = 'block'
        carResultDiv.childNodes.forEach((item) => {
            item.childNodes.forEach((child) => {
                if (child.dataset && result[child.dataset['id']]) {
                    child.innerHTML = result[child.dataset['id']]
                } else if (child.dataset && child.dataset['id'] == 'parkingTime') {
                    child.innerHTML = totalHours + ':' + totalMinutes
                } else if (child.dataset && child.dataset['id'] == 'totalAmount') {
                    child.innerHTML = calculateParkingFee(new Date(result.entryDate), new Date(result.exitDate))
                }
            })
        })
    } else {
        alert('No data found')
    }
}

function searchTotalAmountByPeriod() {
    const startDate = document.getElementById('startDate').value + ' 00:00:00'
    const endDate = document.getElementById('endDate').value + ' 23:59:59'
    let totalAmount = 0;

    json.forEach((item) => {
        const entryDate = new Date(item.entryDate)
        const exitDate = new Date(item.exitDate)

        if (entryDate >= new Date(startDate) && exitDate <= new Date(endDate)) {
            console.log("ITEM", item)
            totalAmount += parseFloat(calculateParkingFee(entryDate, exitDate))
        }

    })

    document.getElementById('totalAmount').innerHTML = totalAmount
}

function searchTotalParkedByPeriod() {
    const startDate = document.getElementById('startDate2').value + ' 00:00:00'
    const endDate = document.getElementById('endDate2').value + ' 23:59:59'
    let totalParked = 0;

    json.forEach((item) => {
        const entryDate = new Date(item.entryDate)
        const exitDate = new Date(item.exitDate)

        if (entryDate >= new Date(startDate) && exitDate <= new Date(endDate)) {
            totalParked += 1
        }
    })

    document.getElementById('totalParked').innerHTML = totalParked
}

function calculateParkingFee(checkInDate, checkOutDate) {
    const weekdayStartHour = 9; // 9am
    const weekdayEndHour = 17; // 5pm
    const firstHalfHourFee = 0.20;
    const nextHalfHourFee = 0.50;
    const oneHourFee = 1.60;
    const weekdayDailyFee = 50.00;
    const weekendDailyFee = 25.00;
    var pushDay = [];

    let diffInDays = checkOutDate - checkInDate; // milliseconds
    diffInDays = diffInDays / 1000 / 60 / 60 / 24; // convert milliseconds to days
    diffInDays = Math.ceil(diffInDays); // round up to nearest day
    const diffInHours = (checkOutDate - checkInDate) / 3600000; // convert milliseconds to hours
    const diffInMinutes = (checkOutDate - checkInDate) / 60000; // convert milliseconds to minutes

    let fee = 0;

    console.log("checkInDate", dayOfWeek[checkInDate.getDay()])
    console.log("checkOutDate", dayOfWeek[checkOutDate.getDay()])

    const day = new Date(checkInDate);
    for (let i = 0; i < diffInDays; i++) {
        if (day.getDay() + i == checkOutDate.getDay()) {
            pushDay.push(checkOutDate)
            break;
        } else {
            pushDay.push(day)
        }
    }

    for (let i = 0; i < pushDay.length; i++) {
        if (pushDay[i].getDay() == 0 || pushDay[i].getDay() == 6) { // weekend
            fee += weekendDailyFee;
        } else { // weekday
            if (diffInMinutes >= 30 && pushDay[i].getHours() >= weekdayStartHour || pushDay[i].getHours() < weekdayEndHour) {
                fee += firstHalfHourFee;
            }
            if (diffInMinutes >= 60 && pushDay[i].getHours() >= weekdayStartHour && pushDay[i].getHours() < weekdayEndHour) {
                fee += nextHalfHourFee;
            }
            if (diffInMinutes > 60 && pushDay[i].getHours() >= weekdayStartHour && pushDay[i].getHours() < weekdayEndHour) {
                if (diffInMinutes - 60 <= 60) {
                    fee += oneHourFee * (diffInMinutes - 60) / 30;
                } else {
                    if (pushDay[0] == pushDay[i]) {
                        fee += (2 * oneHourFee) * (weekdayEndHour - pushDay[i].getHours() - 1);
                    } else if (pushDay[pushDay.length - 1] == pushDay[i]) {
                        fee += (2 * oneHourFee) * (pushDay[i].getHours() - weekdayStartHour - 1);
                    } else {
                        fee += (2 * oneHourFee) * (weekdayEndHour - pushDay[i].getHours());
                    }
                }
            }
        }
    }
    if (diffInHours >= 24) {
        fee += weekdayDailyFee;
    }

    return fee.toFixed(2); // round to 2 decimal places
}

