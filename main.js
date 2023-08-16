//Global Declarations
let legend;
let legContainer;
let legAxis;
let size = {
width: 1600,
height: 550,
margin: {
x: 60,
y: 60
}
}
var daysOfTheWeek = { '1': 'January', '2': 'February', '3': 'March', '4': 'April', '5': 'May', '6': 'June', '7': 'July', '8': 'August', '9': 'September', '10': 'October', '11': 'November', '12': 'December' }

//create svg placemat
let svg = d3.select('#body')
.append('svg')
.classed('svg', true)
.attr('height', size.height)
.attr('width', size.width)

//render json data
let xml = new XMLHttpRequest()
let method = 'GET'
let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
xml.responseType = 'json'
xml.open(method, url, true);
xml.onload = () => {
var data = xml.response
var baseTemp = data.baseTemperature
//Selecting description, adding html and accessing base Temperatur
d3.select('h3#description')
.html(`1753 - 2015: base temperature ${baseTemp}â„ƒ`)
//create an array for each item and a general for all
let year = [], month = [], variance = [], general = []
data.monthlyVariance.forEach(element => {
general.push(element)
year.push(element.year)
month.push(element.month)
variance.push(element.variance)
})

//colorScale
let colors = ['rgb(232, 239, 194)','yellow','gold','orange','orangered','red']
let colorScale = (num) =>{
return num < -.5 ? colors[0] : num >=-.5 && num < -.3 ? colors[1] : num >=-.3 && num < -.1 ? colors[2] : num >=-.1 && num < .1 ? colors[3] : num >=.1 && num < .3 ? colors[4] : colors[5]
}
//minYear & maxYer 
let minYear = d3.min(year, d => d)
let maxYear = d3.max(year, d => d)
//create xAxis & yAxis
let xScale = d3.scaleLinear()
.domain([minYear, maxYear+1])
.range([size.margin.x, size.width-size.margin.x])
let yScale = d3.scaleBand()
.domain(month)
.range([size.margin.x, size.height - size.margin.y])

let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(20)
let yAxis = d3.axisLeft(yScale).tickFormat(d => {
return daysOfTheWeek[`${d}`]
})
let gX = svg.append('g')
.attr('transform', `translate(${0},${size.height - size.margin.y})`)
.attr('id','x-axis')
.call(xAxis)
let gY = svg.append('g')
.attr('transform', `translate(${size.margin.x},0)`)
.attr('id','y-axis')
.call(yAxis)

//text
svg.append('text')
.attr('x', svg.node().getBoundingClientRect().width/2)
.attr('y', svg.node().getBoundingClientRect().height-15)
.text('Years')

//Create tooltip
let tooltip = d3.select('body')
.append('div')
.attr('id','tooltip')
d3.select('.cell-box')
.on('mouseover',()=>{
tooltip 
.attr('aria-hidden',false)
svg.attr('style','background:ghostwhite;transition: .15s ease;')
})
.on('mouseleave',()=>{
tooltip
.attr('aria-hidden',true)
svg.attr('style','background:silver;transition: .15s ease')
})
//Create legend
legContainer = d3.select('body')
.append('svg')
.attr('class','legend-container') 
let legWidth = legContainer.node().getBoundingClientRect().width
let legHeight = legContainer.node().getBoundingClientRect().height

//container for the legend - append rect
legend = legContainer.append('g')
.attr('id','legend')
.selectAll('rect')
.data(colors)
.join('rect')
.classed('legRect',true)
.attr('height',50)
.attr('width', (legWidth-50)/colors.length)
.attr('fill',(d,i)=>colors[i])
.attr('x', (d,i)=> 25+(i * ((legWidth-60)/colors.length)))
.attr('y',50)

let lWidth = legend.node().getBoundingClientRect().width
let lHeight = legend.node().getBoundingClientRect().height
let lMarg = 25
//legend scale
let legScale = d3.scaleLinear()
.domain([d3.min(variance,v=>v),d3.max(variance,v=>v)])
.range([lMarg,legWidth-lMarg])
let legAxis = d3.axisBottom(legScale)
.ticks(4)
legContainer.append('g')
.attr('transform',`translate(${0},${legHeight-30})`)
.call(legAxis) 
.classed('legAxis',true)
//create rows for the Months (y-axis) 
let rows = svg.append('g')
.classed('cell-box',true)
.selectAll('rect')
.data(general)
.enter()
.append('rect')
.classed('cell',true)
.attr('x', d => xScale(d.year))
.attr('y', d => yScale(d.month))
.attr('width', (d)=>{
let numYears = maxYear - minYear
return (size.width - (size.margin.x*2))/numYears
})
.attr('height', (size.height-(2*size.margin.x)) / 12)
//properties
.attr('data-month',d=>d.month-1)
.attr('data-year',d=>d.year)
.attr('data-temp',d=>d.variance) 
.style('fill', d => colorScale(d.variance))
//event listeners 
.on('mouseover', (e) => {
let variNum = e.target.__data__.variance
let yearNum = e.target.__data__.year
let monthNum = e.target.__data__.month
e.target.style = 'fill:gold;transition:.03s ease;';
let colorTarget = colorScale(variNum)
legend.each(color=>{
if(colorTarget == color){
legend
.attr('style',(d,i)=>d==color?`transition:.15s ease;filter:drop-shadow(0px 0px 4px ${colors[i]});height:70px;`:`fill:${colors[i]};transition:.5s ease;filter:none;height:50px;`)
}
})

tooltip
.attr('style',`left:${e.pageX-50}px;top:${e.pageY-150}px;opacity:.75;display:block`)
.attr('data-year', +(yearNum))
.html(`<p>${yearNum} - ${daysOfTheWeek[monthNum]}</p>
<p>${(baseTemp + variNum).toFixed(1)}â„ƒ</p>
<p>${(variNum>0?'+'+variNum.toFixed(1):variNum.toFixed(1))}â„ƒ</p>`)
let tip = document.querySelector('#tooltip')
console.log(tooltip)
})
.on('mouseout', (e) => {
//Create a variable for variances to plug in the fill attribute
let variNum = e.target.__data__.variance
e.target.style = `fill:${colorScale(variNum)};transition:.03s ease;`
tooltip
.attr('style','display: none;')
})
// d3.selectAll('.cell')
// .on('mouseover',(e)=>{
// let variNum = e.target.__data__.variance
// let colorTarget = colorScale(variNum)
// legend.each(color=>{
// if(colorTarget == color){
// legend
// .attr('style',(d,i)=>d==color?`transition:.15s ease;filter:drop-shadow(0px 0px 4px ${colors[i]})`:`fill:${colors[i]};transition:.5s ease;filter:none;`)

// }
// })
// })
}
xml.send()
