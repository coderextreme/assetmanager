#version 300 es
precision mediump float;
/*
The MIT License (MIT)
Copyright (c) 2011 Authors of J3D. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the Software), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
/* Rose functions Copyright (c) 2015 John Carlson */
uniform mat4 mvp;

in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in vec4 vertexColor;

out vec2 fragTexCoord;
out vec4 fragColor;
out vec3 fragNormal;

uniform mat4 view;
uniform vec3 chromaticDispersion;
uniform float bias;
uniform float scale;
uniform float power;

uniform float a;
uniform float b;
uniform float c;
uniform float d;
uniform float tdelta;
uniform float pdelta;

out vec3 t;
out vec3 tr;
out vec3 tg;
out vec3 tb;
out float rfac;
out vec3 fragPosition;

vec3 cart2sphere(vec3 p) {
     float r = pow(p.x*p.x + p.y*p.y + p.z*p.z, 0.5);
     float theta = acos(p.z/r);
     float phi = atan(p.y, p.x);
     return vec3(r, theta, phi);
}

vec3 rose(vec3 p, float a, float b, float c, float d, float tdelta, float pdelta) {
     float rho = a + b * cos(c * p.y + tdelta) * cos(d * p.z + pdelta);
     float x = rho * cos(p.z) * cos(p.y);
     float y = rho * cos(p.z) * sin(p.y);
     float z = rho * sin(p.z);
     return vec3(x, y, z);
}

vec3 rose_normal(vec3 p, float a, float b, float c, float d, float tdelta, float pdelta) {
     /* convert cartesian position to spherical coordinates */
     vec3 base = cart2sphere(p);
     /* add a little to phi */
     vec3 td = base + vec3(0.0, 0.01, 0.0);
     /* add a little to theta */
     vec3 pd = base + vec3(0.0, 0.0, 0.01);

     /* convert back to cartesian coordinates */
     vec3 br = rose(base, a, b, c, d, tdelta, pdelta);
     vec3 bt = rose(td, a, b, c, d, tdelta, pdelta);
     vec3 bp = rose(pd, a, b, c, d, tdelta, pdelta);

     return normalize(cross(bt - br, bp - br));
}

void main()
{
    mat3 mvm3=mat3(
                view[0].x,
                view[0].y,
                view[0].z,
                view[1].x,
                view[1].y,
                view[1].z,
                view[2].x,
                view[2].y,
                view[2].z
    );
    gl_Position = mvp * vec4(rose(cart2sphere(vertexPosition), a, b, c, d, tdelta, pdelta), 1.0);

    fragNormal = mvm3*rose_normal(vertexPosition, a, b, c, d, tdelta, pdelta);
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
    fragPosition = cart2sphere(vertexPosition);//vertexPosition;

    vec3 incident = normalize((view * vec4(rose(cart2sphere(vertexPosition), a, b, c, d, tdelta, pdelta), 1.0)).xyz);

    t = reflect(incident, fragNormal)*mvm3;
    tr = refract(incident, fragNormal, chromaticDispersion.x)*mvm3;
    tg = refract(incident, fragNormal, chromaticDispersion.y)*mvm3;
    tb = refract(incident, fragNormal, chromaticDispersion.z)*mvm3;
    rfac = bias + scale * pow(0.5+0.5*dot(incident, fragNormal), power);
}

