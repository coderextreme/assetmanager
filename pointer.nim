import ptr_math

var data: array[6, int] = [ 0, 1, 2, 3, 4, 5 ]
var p = cast[ptr UncheckedArray[int]](data[0].addr)

p = p + 1
