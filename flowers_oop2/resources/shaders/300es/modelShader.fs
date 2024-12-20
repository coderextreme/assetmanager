#version 300 es
precision mediump float;
/*
The MIT License (MIT)
Copyright (c) 2011 Authors of J3D. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the Software), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

uniform samplerCube environmentMap;
in vec3 fragPosition;
in vec3 t;
in vec3 tr;
in vec3 tg;
in vec3 tb;
in float rfac;

out vec4 finalColor;

void main() {

#ifdef GL_ES
    vec4 ref = texture(environmentMap, t);
    vec4 ret = vec4(1.0);

    ret.r = texture(environmentMap, tr).r;
    ret.g = texture(environmentMap, tg).g;
    ret.b = texture(environmentMap, tb).b;
#else
    vec4 ref = textureCube(environmentMap, t);
    vec4 ret = vec4(1.0);

    ret.r = textureCube(environmentMap, tr).r;
    ret.g = textureCube(environmentMap, tg).g;
    ret.b = textureCube(environmentMap, tb).b;
#endif
    finalColor = ret * rfac + ref * (1.0 - rfac);
}
