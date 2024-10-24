#version 120

varying float r;

void main()
{

    gl_FragColor = normalize(vec4(r, r, r, r));
}
