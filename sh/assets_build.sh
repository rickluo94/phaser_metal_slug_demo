#!/bin/bash

# bash --version

sound_folder="src/assets/sound/common"
sound_feature_folder="src/assets/sound/feature"
image_common_folder="src/assets/images/common"
image_freature_folder="src/assets/images/feature"
output_file="src/assets/json/setting.json"

allObj=()
duplicate_files=()
spineSetting=$1
spinePngs=""

function createFolder() {
    echo "創建assets"
    if [ ! -e "src/assets" ]; then
        mkdir -p src/assets/{images,json,sound}
        mkdir -p src/assets/images/{common,feature}
        mkdir -p src/assets/sound/{common,feature}

        local json_structure='{
    "sound": {
        "common": {},
        "feature": {}
    },
    "images": {
        "common": {},
        "feature": {}
    }
}'
    echo "$json_structure" > "$output_file"
    fi
}

function check_files_exist() {
    local file_name=$1
    local folder_path="$2"
    local png_file_exists=0
    local json_file_exists=0
    local skel_file_exists=0
    local atlas_file_exists=0
    local webp_file_exists=0
    local avif_file_exists=0
    local fnt_file_exists=0

    for item in "$folder_path"/*; do
        if [ -f "$item" ]; then
                file="${item##*/}"
                file_name_only="${file%.*}"
                file_extension="${file##*.}"
                if [ "$file_name_only" == "$file_name" ]; then
                    case "$file_extension" in
                            "png")
                                png_file_exists=1
                                ;;
                            "webp")
                                webp_file_exists=1
                                ;;
                            "avif")
                                avif_file_exists=1
                                ;;
                            "json")
                                json_file_exists=1
                                ;;
                            "skel")
                                skel_file_exists=1
                                # spine v4.1的特殊判斷, 是否包兩張圖
                                newFileSkelPng="$file_name""2"
                                if [ -f "$folder_path/$newFileSkelPng.png" ]; then
                                        if [ ! -e "$folder_path/$newFileSkelPng.skel" ] && [ ! -e "$folder_path/$newFileSkelPng.atlas" ]; then
                                            spinePngs=$newFileSkelPng
                                        fi
                                fi
                                ;;
                            "atlas")
                                atlas_file_exists=1
                                ;;
                            "fnt")
                                fnt_file_exists=1
                                ;;
                    esac
                fi
            fi
        done
    if [ "$spinePngs" = "$file_name" ]; then
        return -1; # No Input
    fi

    if [ $png_file_exists -eq 1 ] && [ $skel_file_exists -eq 1 ] && [ $atlas_file_exists -eq 1 ]; then
        return 4 # spine 4.1
    elif [ $png_file_exists -eq 1 ] && [ $json_file_exists -eq 1 ] && [ $atlas_file_exists -eq 1 ]; then
        newFileSkelPng="$file_name""2"
        if [ -f "$folder_path/$newFileSkelPng.png" ]; then
                if [ ! -e "$folder_path/$newFileSkelPng.skel" ] && [ ! -e "$folder_path/$newFileSkelPng.atlas" ]; then
                    spinePngs=$newFileSkelPng
                fi
        fi
        return 3 # spine 3.7~
    elif [ $webp_file_exists -eq 1 ] && [ $json_file_exists -eq 1 ]; then
        return 5 # 使用webp的序列圖
    elif [ $avif_file_exists -eq 1 ] && [ $json_file_exists -eq 1 ]; then
        return 6 # 使用 avif 的序列圖
    elif [ $png_file_exists -eq 1 ] && [ $json_file_exists -eq 1 ]; then
        return 2 # atlas
    elif [ $png_file_exists -eq 1 ] && [ $fnt_file_exists -eq 1 ]; then
        return 1 # font+png
    elif [ $webp_file_exists -eq 1 ] && [ $fnt_file_exists -eq 1 ]; then
        return 7 # font+webp
    else
        return 0 # image
    fi
}

function traverse_folder() {
    for element in `ls $1`; do
        dir_or_file=$1"/"$element

        # 跳过 common/loading 文件夹
        if [[ "$dir_or_file" == *"common/loading"* ]]; then
            continue
        fi

        if [ -d $dir_or_file ]; then
            #判斷目錄內是否有資料
            if [ -n "$(ls -A "$dir_or_file")" ]; then
                if [ "$2" = "" ]; then
                    path="${element}"
                else
                    path="$2/${element}"

                    # spine有多個圖片的話放資料夾調整
                    if [ "$2" = "spine" ]; then
                        allObj[$5]+=\"$element\":" { \"type\": \"spine\", \"path\": \"$2/${element}\", \"file\": \"$element\", \"nt\": \"spine4\" };"
                        continue
                    fi
                fi
                traverse_folder "$dir_or_file" "$path" "$dir_or_file" "$4" "$5"
            fi

        elif [ -f $dir_or_file ]; then
                file_name=$(basename "$dir_or_file")
                file_outext="${file_name%.*}"
                file_extension="${file_name##*.}"
                indexOf "$pathFolder-$file_outext"
                idx=$?
                pathFolder=$2
                if [[ $pathFolder == *"lang"* ]]; then
                    # 拆除/ 作為陣列
                    IFS='/' read -ra parts <<< "$pathFolder"
                    if [ "${#parts[@]}" -gt 2 ]; then
                        # 刪除前兩個元素
                        new_parts=("${parts[@]:2}")
                        # 使用/串起剩下的元素
                        new_path=$(IFS=/; echo "${new_parts[*]}")
                        pathFolder="{lang}/$new_path"
                    else
                        pathFolder="{lang}"
                    fi
                fi
                if [ $idx -eq 1 ]; then
                    duplicate_files+=("$pathFolder-$file_outext")
                    check_files_exist "$file_outext" "$3"
                    result=$?
                    if [ $result -eq 4 ]; then
                        # spine 4.1
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"spine\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"nt\": \"spine4\" };"
                    elif [ $result -eq 3 ]; then
                        # spine 3.7~
                        if [ "$spineSetting" = "-a" ]; then
                            allObj[$5]+=\"$file_outext\":" { \"type\": \"spine\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"nt\": \"spine3\" };"
                        else
                            echo "assets有不兼容檔案 file: $file_outext (for spine 3.x 目前不會包進json)"
                        fi
                    elif [ $result -eq 2 ]; then
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"atlas\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"ext\": \"png\" };"
                    elif [ $result -eq 5 ]; then
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"atlas\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"ext\": \"webp\" };"
                    elif [ $result -eq 6 ]; then
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"atlas\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"ext\": \"avif\" };"
                    elif [ $result -eq 1 ]; then
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"bitmap\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"ext\": \"png\" };"
                    elif [ $result -eq 7 ]; then
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"bitmap\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"ext\": \"webp\" };"
                    elif [ $result -eq 255 ]; then
                        spinePngs=""
                    elif [ $file_extension == 'mp3' ]; then
                        soundLoop=""
                        if [[ $file_outext == *"BGM"* ]] || [[ $file_outext == *"bgm"* ]] ; then
                            soundLoop=", \"loop\": true"
                        fi
                        newPathFolder="";
                        #空
                        if [ -z "$pathFolder" ]; then
                            newPathFolder=$4
                        else
                            newPathFolder=$4/$pathFolder
                        fi
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"sound\", \"root\": \"sound\", \"path\": \"$newPathFolder\", \"file\": \"$file_outext\"$soundLoop };"
                    elif [ $file_extension == 'ogg' ]; then
                        soundLoop=""
                        if [[ $file_outext == *"BGM"* ]] || [[ $file_outext == *"bgm"* ]]; then
                            soundLoop=", \"loop\": true"
                        fi
                        newPathFolder="";
                        #空
                        if [ -z "$pathFolder" ]; then
                            newPathFolder=$4
                        else
                            newPathFolder=$4/$pathFolder
                        fi
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"sound\", \"root\": \"sound\", \"path\": \"$newPathFolder\", \"file\": \"$file_outext\"$soundLoop, \"ext\": \"$file_extension\" };"
                    else
                        file_extension="${file_name##*.}"
                        allObj[$5]+=\"$file_outext\":" { \"type\": \"image\", \"path\": \"$pathFolder\", \"file\": \"$file_outext\", \"ext\": \"$file_extension\" };"
                    fi
                fi
        fi
    done
}

function indexOf() {
    local search_element=$1
    for element in "${duplicate_files[@]}"; do
        if [ "$element" = "$search_element" ]; then
            return 0
        fi
    done
    return 1
}

function fold() {
    traverse_folder "$1" "" "" "$2" "$3"

    # 去最後一行分號
    allObj[$3]=${allObj[$3]%;}
    # ;換成,並換行
    allObj[$3]=$(echo "${allObj[$3]}" | sed 's/;/,\n                  /g')

    # 判斷資料是否為空
    if [[ -z "${allObj[$3]}" ]]; then
        allObj[$3]='{}';
    else
        allObj[$3]='{
                  '"$(echo "${allObj[$3]}")"'
            }';
    fi
}

function key_exists() {
    local key="$1"
    for existing_key in "${keys[@]}"; do
        if [[ "$key" == "$existing_key" ]]; then
                return 0
        fi
    done
    return 1
}

if [ ! -e "src/assets" ]; then
    echo "該assets路徑不存在"
    createFolder
    exit 1
fi

echo "開始素材打包文件 $output_file"

fold "$sound_folder" "common" "0"
fold "$sound_feature_folder" "feature" "1"
fold "$image_common_folder" "common" "2"
fold "$image_freature_folder" "feature" "3"

json_structure='{
      "sound": {
            "common": '${allObj[0]}',
            "feature": '${allObj[1]}'
      },
      "images": {
            "common": '${allObj[2]}',
            "feature": '${allObj[3]}'
      }
}'
echo "$json_structure" > "$output_file"

echo "素材打包文件 $output_file 已完成"

# ===== 檢查機制 =====
json_content=$(cat "$output_file")
# Array to store keys
keys=()
# Array to store duplicate keys
duplicate_keys=()
commonKey=""

# Loop through each line of the JSON content
while IFS= read -r line; do
    # Extract the key from the line
    key=$(echo "$line" | cut -d ":" -f 1 | tr -d '" ')
    if [ "$key" = "common" ] && [ "$commonKey" = "" ]; then
        commonKey="common"
    elif [ "$key" = "feature" ] && [ "$commonKey" = "common" ]; then
        commonKey="feature"
    elif key_exists "$key"; then
        duplicate_keys+=("$key")
    else
        keys+=("$key")
    fi
done <<< "$json_content"

# Check if there are any duplicate keys
if [[ ${#duplicate_keys[@]} -gt 0 ]]; then
    for key in "${duplicate_keys[@]}"; do
        if [ "$key" != "}" ] && [ "$key" != "}," ]; then
                echo "警告!! 你的json有重複的key! 請確認重複的key: $key"
        fi
    done
fi
