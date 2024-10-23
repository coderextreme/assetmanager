#version 330
#extension GL_NV_shadow_samplers_cube : enable

uniform samplerCube cubemap;

in vec2 v_texCoord;
in vec3 position;

out vec4 color;

void main()
{
    	color = textureCube(cubemap, position);
    	//color = vec4(position, 1.0);
}
