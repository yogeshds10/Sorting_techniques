/**
 * 
 */

(function($)
	{
		$.fn.sorting = function(options)
		{
			var settings = $.extend( {}, $.fn.sorting.defaults, options );
			var canvas = d3.select("svg");
			var positionArray = new Array();
			var dataArray = settings.data;
			var timeoutVar;
			var reset = false;
			
			$(document).ready(function(){
				
				function getAnimationSpeed(){
					var aSpeed = parseInt($("#animationSpeed").attr("max")) 
									- parseInt($("#animationSpeed").val())
									+ parseInt($("#animationSpeed").attr("min")) ;
					return aSpeed;
				}

				function setNewValues(){

					var inputData = $(".inputValues").val().split(",");
					var inputValues = new Array();
					for (var i = 0; i < inputData.length; i++) {
						inputValues[i] = parseInt(inputData[i]);
					};
					var animationSpeed = getAnimationSpeed();
					
					reset = true;
					clearTimeout(timeoutVar);
					
					if(methods.validateData(inputValues)){
						options = {
							speed : animationSpeed,
							data : inputValues
						};
						settings = $.extend( {}, $.fn.sorting.defaults, options );
					}
					methods.reset();
				}

				$("a.sortLink").click(function(){
					$this = $(this);
					$("a.sortLink").removeClass("selectedSort");
					$this.addClass("selectedSort");
					
					// reset = true;
					// settings = $.extend( true,{}, $.fn.sorting.defaults, options );
					// clearTimeout(timeoutVar);
					// methods.reset();
					setNewValues();
				});
				
				methods.createPositionArray();
				methods.createSVG();

				$("#updateInputValues").click(function(){
					setNewValues();
				});
				$("#startSorting").click(function(){
					methods.init();
				});


				var $document   = $(document),
		            selector    = '[data-rangeslider]',
		            $element    = $(selector);

		        // Basic rangeslider initialization
		        $element.rangeslider({
		            // Deactivate the feature detection
		            polyfill: false,
		            // Callback function
		            onInit: function() {},
		            // Callback function
		            onSlide: function(position, value) {
		            },
		            // Callback function
		            onSlideEnd: function(position, value) {

		            	settings.speed = getAnimationSpeed();
		            	
		            }
		        });
				
			});
			
			
			var methods = {
					init: function() {		
						
						var sortingIndex = $("a.selectedSort").attr("index");
						methods.chooseSorting(parseInt(sortingIndex));
						
						return this;
					},
					validateData : function(inputValues) {
						
						var inputValidStatus = true;
						var errorMessage = "";
						for(var i=0; i<inputValues.length;i++){
							if(inputValues[i] < 10 || inputValues[i] > 99){
								inputValidStatus = false;
								errorMessage = settings.valueRangeErrorMessage;
							}
						}
						if(inputValues.length < 5 || inputValues.length > 15){
							inputValidStatus = false;
							errorMessage = settings.numberOfValuesErrorMessage;
						}
						if(!inputValidStatus){
							$("#validationErrorMessage").text(errorMessage).show();
						}else{
							$("#validationErrorMessage").text("").hide();
						}
						return inputValidStatus;
					},
					reset : function() {
						reset = false;
						settings = $.extend( {}, $.fn.sorting.defaults, options );
						dataArray = settings.data;
						methods.createPositionArray();
						methods.updateData();
						var sel = canvas.selectAll("rect")
									.attr("class","");
			
					},
					updateData : function() {
						var sel = canvas.selectAll("g")
								    .data(settings.data);
							
							sel.enter().append("g");
							sel.exit().remove();
							
							sel.transition().duration(200)
									.attr("transform", function(d, i) { return "translate(" + methods.getX(i) + "," + methods.getY(d) + ")"; })
									;
							sel.select("rect")
									.attr("width", settings.barWidth)
									.attr("height", function(d){return d;});

							sel.select("text")
									.attr("x", 15)
									.attr("y", 0)
//									.attr("dy", ".35em")
									.attr("dy", "-4px")
									.text(function(d) { return d; });		
							
					},
					createSVG : function() {
						
						var bar = canvas.selectAll("g")
									.data(settings.data)
									.enter()
										.append("g")
										.attr("transform", function(d, i) { return "translate(" + methods.getX(i) + "," + methods.getY(d) + ")"; })
										;
						bar.append("rect")
								.attr("width", settings.barWidth)
								.attr("height", function(d){return d;});

						bar.append("text")
								.attr("x", 15)
								.attr("y", 0)
								.attr("dy", "-4px")
								.text(function(d) { return d; });
					},
					chooseSorting : function(sortingIndex) {
						
						switch (sortingIndex) {
						case 1:
							methods.bubbleSort();
							break;
						case 2:
							methods.selectionSort();
							break;
						case 3:
							methods.insertionSort();
							break;
						case 4:
							methods.mergeSort();
							break;
						case 5:
							methods.quickSort();
							break;
						default:
							break;
						}
					},
					createPositionArray : function() {
						for(var i=0; i<settings.data.length; i++){
							positionArray[i] = i;
						}
					},
					getGroupElement : function(index) {
						return d3.selectAll("g").filter(function(d, i) { return i == positionArray[index]; });
					},
					getRectElement : function(index) {
						return d3.selectAll("rect").filter(function(d, i) { return i == positionArray[index]; });
					},
					getX : function(index) {
						var canvasWidth = $("svg").width();
						
						var dataAreaWidth = (settings.data.length * settings.barWidth) + (settings.data.length * settings.gapWidth);
						var xStartPosition = (canvasWidth - dataAreaWidth) / 2;
						
						return xStartPosition + (index * (settings.barWidth + settings.gapWidth));
					},
					getY : function(value) {
						return settings.baseLineYposition - value;
					},
					translateEle : function(ele,speed,posX,posY){
						ele.transition().duration(speed)
								.attr("transform", function(d, i) { return "translate(" + posX + "," + posY + ")"; });
						
					},
					bubbleSort : function() {
						i = 0;
						j = 0;
						
						function bubbleSortInner(){
							timeoutVar = setTimeout(function()
							{
								if(j>0){
									var group0 = methods.getGroupElement(j-1);
									var bar0 = methods.getRectElement(j-1);
									bar0.attr("class","");
								}
								var group1 = methods.getGroupElement(j);
								var group2 = methods.getGroupElement(j+1);
								
								var bar1 = methods.getRectElement(j);
								var bar2 = methods.getRectElement(j+1);
								
								bar1.attr("class","rect1Color");
								bar2.attr("class","rect2Color");
								
								if(j < dataArray.length-1)
								{
									if(dataArray[j] > dataArray[j+1])
									{
										temp = dataArray[j];
										dataArray[j] = dataArray[j + 1];
										dataArray[j + 1] = temp;
										
										group1 = methods.getGroupElement(j);
										group2 = methods.getGroupElement(j+1);
										
										var t1 = d3.transform(group1.attr("transform")),
									    	y1 = t1.translate[1],
											t2 = d3.transform(group2.attr("transform")),
									    	y2 = t2.translate[1];
										
										methods.translateEle(group1,settings.speed/2,methods.getX(j+1),y1);
										methods.translateEle(group2,settings.speed/2,methods.getX(j),y2);

										temp = positionArray[j];
										positionArray[j] = positionArray[j + 1];
										positionArray[j + 1] = temp;
										
									}
									j++;
								}else{
									bar1.attr("class","");
									bar2.attr("class","");
									
									i++;
									j=0;
								}
								if(i<dataArray.length-1 && !reset){
									bubbleSortInner();	
								}
								if(reset){
									methods.reset();
								}
								
							}, settings.speed);
						}
						bubbleSortInner();
					},
					selectionSort : function() {
						
						var i = 0;
						var j = i+1;
						var pos = i;

						function removeColor(index){
							var bar1 = d3.selectAll("rect").filter(function(d, z) { return z == positionArray[index]; });
							bar1.attr("class","");
							
						}
						function selectionSortInner()
						{
							timeoutVar = setTimeout(function()
							{	
								var bar0 = methods.getRectElement(j-1);
								var bar1 = methods.getRectElement(i);
								var bar2 = methods.getRectElement(j);
								
								if(j-1 != pos){
									bar0.attr("class","");
								}
								bar1.attr("class","rect1Color");
								bar2.attr("class","rect2Color");
								
								if(j < dataArray.length)
								{
									if(dataArray[j] < dataArray[pos])
									{
										if(pos != i){
											bar3 = methods.getRectElement(pos);
											bar3.attr("class","");
										}
										pos = j;
										bar3 = methods.getRectElement(pos);
										bar3.attr("class","rect3Color");
									}
									j++;
								}
								if(j == dataArray.length){
									var group1 = methods.getGroupElement(i);
									var group2 = methods.getGroupElement(pos);
									
									var t1 = d3.transform(group1.attr("transform")),
								    	y1 = t1.translate[1],
										t2 = d3.transform(group2.attr("transform")),
								    	y2 = t2.translate[1];
									
									group1.transition().duration(settings.speed/2)
												.attr("transform", function(d, z) { return "translate(" + methods.getX(pos) + "," + y1 + ")"; })
												.each("end",removeColor(i));
									group2.transition().duration(settings.speed/2)
												.attr("transform", function(d, z) { return "translate(" + methods.getX(i) + "," + y2 + ")"; })
												.each("end",removeColor(pos));
									
									setTimeout(function()
									{
										var allBars = d3.selectAll("rect");
										allBars.attr("class","");
									},settings.speed/2);
									
									if(i < pos){
										temp = dataArray[i];
										dataArray[i] = dataArray[pos];
										dataArray[pos] = temp;
										
										
										temp = positionArray[i];
										positionArray[i] = positionArray[pos];
										positionArray[pos] = temp;
									}
									
									
									i++;
									j=i+1;
									pos = i;
								}
								if(i<dataArray.length-1){
									selectionSortInner();
								}
								
								
							}, settings.speed);	
						}

						selectionSortInner();
						
					},
					insertionSort : function() {
						
						var i = 1;
						var j = i-1;
						key = dataArray[i];
						
						function insertionSortInner(){
							timeoutVar = setTimeout(function()
							{
								var allBars = d3.selectAll("rect");
								allBars.attr("class","");
								
								var group1 = methods.getGroupElement(j+1);
								var group2 = methods.getGroupElement(j);
								
								var bar1 = methods.getRectElement(j+1);
								var bar2 = methods.getRectElement(j);
								
								bar1.attr("class","rect1Color");
								bar2.attr("class","rect2Color");
								
								
								if(dataArray[j] > key){
									temp = dataArray[j];
									dataArray[j] = dataArray[j+1];
									dataArray[j+1] = temp;
									
									group1 = methods.getGroupElement(j+1);
									group2 = methods.getGroupElement(j);
									
									var t1 = d3.transform(group1.attr("transform")),
								    	y1 = t1.translate[1],
										t2 = d3.transform(group2.attr("transform")),
								    	y2 = t2.translate[1];
									
									methods.translateEle(group1,settings.speed/2,methods.getX(j),y1);
									methods.translateEle(group2,settings.speed/2,methods.getX(j+1),y2);
									
									
									temp = positionArray[j];
									positionArray[j] = positionArray[j + 1];
									positionArray[j + 1] = temp;
									
									j--;
								}else{
									
									j=-1;
								}
								
								if(j == -1){
									i++;
									key = dataArray[i];
									j=i-1;
								}
								
								if(i<dataArray.length && !reset){
									insertionSortInner();	
								}
								if(i==dataArray.length){
									var allBars = d3.selectAll("rect");
									allBars.attr("class","");
								}
								if(reset){
									methods.reset();
								}
								
							}, settings.speed);
						}
						insertionSortInner();
						
					},
					mergeSort : function() {
						
						var mergeEvents = new Array();
						var mergeFunCount = 0; 
						
						var mergesortInner = function(start,end){
							
							if(start >= end){
								return;
							}
							var partition = parseInt(start + ((end - start + 1) / 2));
							
							mergesortInner(start,partition-1);
							mergesortInner(partition,end);
							merge(start,end);
						};
						
						var merge = function(start,end){
							
							var count = 0;
							mergeEvents[mergeFunCount] = new Array();
							mergeEvents[mergeFunCount][count] = [start,end,"C"];
							count++;
							if(start < end){
								
								var tempArr = new Array();
								for(var z=0;z<dataArray.length;z++){
									tempArr[z] = dataArray[z];
								}
								var partition = parseInt(start + ((end - start + 1) / 2));
								
								var i=start;
								var j=partition;
								var k=start;
								var nL = partition;
								var nR = (end+1);
								
								while(i<nL && j<nR){
									if(tempArr[i] < tempArr[j]){
										dataArray[k] = tempArr[i];
										mergeEvents[mergeFunCount][count] = [i,k,"A"];
										i++;count++;
									}else{
										dataArray[k] = tempArr[j];
										mergeEvents[mergeFunCount][count] = [j,k,"A"];
										j++;count++;
									}
									k++;
								}
								while(i<nL){
									dataArray[k] = tempArr[i];
									mergeEvents[mergeFunCount][count] = [i,k,"A"];
									i++;k++;count++;
								}
								while(j<nR){
									dataArray[k] = tempArr[j];
									mergeEvents[mergeFunCount][count] = [j,k,"A"];
									j++;k++;count++;
								}
								var mergeHalfCount = mergeEvents[mergeFunCount].length;
								for(var z=0; z<mergeHalfCount;z++){
									if(mergeEvents[mergeFunCount][z][2] != "C"){
										mergeEvents[mergeFunCount][count] = new Array();
										mergeEvents[mergeFunCount][count][0] = mergeEvents[mergeFunCount][z][0];
										mergeEvents[mergeFunCount][count][1] = mergeEvents[mergeFunCount][z][1];
										mergeEvents[mergeFunCount][count][2] = "AR";
										count++;
									}
								}
								
								mergeEvents[mergeFunCount][count] = [start,end,"CL"];
								
//								for(var z=0;z<mergeEvents[mergeFunCount].length;z++){
//									console.log(mergeEvents[mergeFunCount][z][0] +"|"+mergeEvents[mergeFunCount][z][1] +"|"+mergeEvents[mergeFunCount][z][2]);
//								}
								
								mergeFunCount++;
								
							}
						};
						
						mergesortInner(0,dataArray.length-1);
						console.log(dataArray);
						
						
						var mergeFinalEvents = new Array();
						for(var i=0; i<mergeEvents.length; i++)
						{
							for(var j=0; j<mergeEvents[i].length; j++)
							{
								mergeFinalEvents.push(mergeEvents[i][j]);
							}
						}
						

						var animateBarsDown = function(elementIndex,positionIndex)
						{
							group = methods.getGroupElement(elementIndex);
							
							var t = d3.transform(group.attr("transform")),
						    	y = t.translate[1] + 200;
								
							methods.translateEle(group,settings.speed,methods.getX(positionIndex),y);
						};
						var animateBarsUp = function(elementIndex,positionIndex)
						{
							group = methods.getGroupElement(elementIndex);
							
							var t = d3.transform(group.attr("transform")),
						    	y = t.translate[1] - 200;
								
							methods.translateEle(group,settings.speed,methods.getX(positionIndex),y);
						};
						var colorBars = function(startIndex,endIndex)
						{
							for(var ind=startIndex; ind<=endIndex; ind++)
							{
								var bar = methods.getRectElement(ind);
								bar.attr("class","rect1Color");
							}
						};
						var removeBarsColor = function(startIndex,endIndex)
						{
							for(var ind=startIndex; ind<=endIndex; ind++)
							{
								var bar = methods.getRectElement(ind);
								bar.attr("class","");
							}
						};
						
						var positionTempArr = new Array();
						for(var z=0;z<positionArray.length;z++){
							positionTempArr[z] = positionArray[z];
						}
						var mergeEventCount = 0;
						var animateMerge = function(){
							timeoutVar = setTimeout(function(){
								switch(mergeFinalEvents[mergeEventCount][2])
								{
									case "C": 
										var startIndex = mergeFinalEvents[mergeEventCount][0];
										var endIndex = mergeFinalEvents[mergeEventCount][1];
										colorBars(startIndex,endIndex);
										break;
									case "CL": 
										var startIndex = mergeFinalEvents[mergeEventCount][0];
										var endIndex = mergeFinalEvents[mergeEventCount][1];
										removeBarsColor(startIndex,endIndex);
										
										for(var z=0;z<positionTempArr.length;z++){
											positionArray[z] = positionTempArr[z];
										}
										
										break;
									case "A": 
										var elementIndex = mergeFinalEvents[mergeEventCount][0];
										var positionIndex = mergeFinalEvents[mergeEventCount][1];
										animateBarsDown(elementIndex,positionIndex);
										
										positionTempArr[positionIndex] = positionArray[elementIndex];
										break;
									case "AR": 
										var elementIndex = mergeFinalEvents[mergeEventCount][0];
										var positionIndex = mergeFinalEvents[mergeEventCount][1];
										animateBarsUp(elementIndex,positionIndex);
										break;
									default:
										break;
								}
								mergeEventCount++;
								if(mergeEventCount < mergeFinalEvents.length){
									animateMerge();
								}
							},settings.speed);
						};
						animateMerge();
					},
					quickSort : function() {
						
						var eventRegisterArray = new Array();
						var eventNum = 0;
						var animYes = 1;
						var animNo = 0;
						var loopEndYes = 1;
						var loopEndNo = 0;
						
						var animateBars = function(firstElement,secondElement,standardElement){
							
							group1 = methods.getGroupElement(firstElement);
							group2 = methods.getGroupElement(secondElement);
							
							var t1 = d3.transform(group1.attr("transform")),
						    	y1 = t1.translate[1],
								t2 = d3.transform(group2.attr("transform")),
						    	y2 = t2.translate[1];
							
							methods.translateEle(group1,settings.speed,methods.getX(secondElement),y1);
							methods.translateEle(group2,settings.speed,methods.getX(firstElement),y2);
						};
						
						var quicksortInner = function(start,end)
						{
							if(start >= end){
								return;
						    }
						    pivot=dataArray[start]; 
						    var partitionIndex = end;
						    
						    for(var i=end; i>=start+1; i--)
						    {
					    	    if(dataArray[i]>=pivot)
						        {
					            	temp = dataArray[i];
						            dataArray[i] = dataArray[partitionIndex];
						            dataArray[partitionIndex] = temp;
						            
									eventRegisterArray[eventNum] = [i,partitionIndex,animYes,start,loopEndNo];
									eventNum++;
									
						            partitionIndex--;
						        }else{
						        	eventRegisterArray[eventNum] = [i,partitionIndex,animNo,start,loopEndNo];
									eventNum++;
						        }
						    }
						    	
							temp = dataArray[partitionIndex];
							dataArray[partitionIndex] = dataArray[start];
							dataArray[start] = temp;
							
							eventRegisterArray[eventNum] = [i,partitionIndex,animYes,start,loopEndYes];
							eventNum++;
							
							quicksortInner(start,partitionIndex-1);
						    quicksortInner(partitionIndex+1,end);
						};
						
						quicksortInner(0,dataArray.length-1);
						
						var cc = 0;
						function animateQuick(){
							timeoutVar = setTimeout(function(){
								
								if(cc > 0){
									var bar1 = methods.getRectElement(eventRegisterArray[cc-1][0]);
									var bar2 = methods.getRectElement(eventRegisterArray[cc-1][1]);
									
									bar1.attr("class","");
									bar2.attr("class","");
								}
								if(cc == eventRegisterArray.length){
									return;
								}
								
								
								var bar1 = methods.getRectElement(eventRegisterArray[cc][0]);
								var bar2 = methods.getRectElement(eventRegisterArray[cc][1]);
								var pivot = methods.getRectElement(eventRegisterArray[cc][3]);
								
								bar1.attr("class","rect1Color");
								bar2.attr("class","rect2Color");
								pivot.attr("class","rect3Color");
								
								
								if(eventRegisterArray[cc][2] == 1){
									animateBars(eventRegisterArray[cc][0],eventRegisterArray[cc][1],0);
	
									temp = positionArray[eventRegisterArray[cc][0]];
									positionArray[eventRegisterArray[cc][0]] = positionArray[eventRegisterArray[cc][1]];
									positionArray[eventRegisterArray[cc][1]] = temp;
								}else{
									
								}
								cc++;
								if(cc <= eventRegisterArray.length){
									animateQuick();
								}
							},settings.speed);
						}
						animateQuick();
						
						
					}
					
				};
			
			
		    
			
		};
		
		$.fn.sorting.defaults = {
			speed : 1000,
			data : [34,26,85,36,78,22,66,99,35,26,75],
			baseLineYposition : 200,
			barWidth : 50,
			gapWidth : 5,
			valueRangeErrorMessage : "Sorry, you're restricted to values between 10 and 99 inclusive.",
			numberOfValuesErrorMessage : "You can't have more than 15 elements!"
		};
		
	}
)(jQuery);

